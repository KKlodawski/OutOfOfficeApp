using api.DTO;
using api.models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers;

[ApiController]
[Route("[controller]")]
public class ApprovalRequestController : ControllerBase
{
    private readonly OutofofficeContext _outofofficeContext;

    public ApprovalRequestController(OutofofficeContext outofofficeContext)
    {
        _outofofficeContext = outofofficeContext;
    }

    [HttpGet]
    [Route("getApprovalRequests")]
    public async Task<IActionResult> getApprovalRequests()
    {
        try
        {
            var approvalRequests =
                await _outofofficeContext
                    .Approvalrequests
                    .Select(approvalRequest => new ApprovalRequestDTO
                    {
                        Id = approvalRequest.Id,
                        Approver = approvalRequest.Approver,
                        ApproverFullName = approvalRequest.Approver != null ? approvalRequest.ApproverNavigation.FullName : null,
                        LeaveRequest = approvalRequest.LeaveRequest,
                        Status = approvalRequest.Status,
                        Comment = approvalRequest.Comment
                    })
                    .ToListAsync();
            if (approvalRequests.Count <= 0)
                return NotFound("Approval Requests not found!");
            return Ok(approvalRequests);
        } catch (Exception e)
        {
            return BadRequest($"Error while fetching approval requests! {e.Message}");
        }
    }

    [HttpGet]
    [Route("getApprovalRequestById")]
    public async Task<IActionResult> getApprovalRequestById(string approvalRequestId)
    {
        try
        {
            int.TryParse(approvalRequestId, out int parsedId);
            var approvalRequest =
                await _outofofficeContext
                    .Approvalrequests
                    .Where(e => e.Id == parsedId)
                    .Select(approvalRequest => new ApprovalRequestDTO
                    {
                        Id = approvalRequest.Id,
                        Approver = approvalRequest.Approver,
                        ApproverFullName = approvalRequest.Approver != null ? approvalRequest.ApproverNavigation.FullName : null,
                        LeaveRequest = approvalRequest.LeaveRequest,
                        Status = approvalRequest.Status,
                        Comment = approvalRequest.Comment
                    })
                    .FirstOrDefaultAsync();
            if (approvalRequest == null)
                return NotFound("Approval Request with given id doesn't exists");
            return Ok(approvalRequest);
        } catch (Exception e)
        {
            return BadRequest($"Error while fetching approval requests! {e.Message}");
        }
    }
    
    [HttpGet]
    [Route("getAssignedApprovalRequests")]
    public async Task<IActionResult> getAssignedApprovalRequests(string approverId)
    {
        try
        {
            int.TryParse(approverId, out int parsedId);
            var approver =
                await _outofofficeContext
                    .Employees
                    .Where(e => e.Id == parsedId)
                    .FirstOrDefaultAsync();
            if (approver == null)
                return NotFound("Employee with given id doesn't exists");
            var approvalRequests =
                await _outofofficeContext
                    .Approvalrequests
                    .Where(approvalRequest => approvalRequest.Employees.Contains(approver))
                    .Select(approvalRequest => new ApprovalRequestDTO
                    {
                        Id = approvalRequest.Id,
                        Approver = approvalRequest.Approver,
                        ApproverFullName = approvalRequest.Approver != null ? approvalRequest.ApproverNavigation.FullName : null,
                        LeaveRequest = approvalRequest.LeaveRequest,
                        Status = approvalRequest.Status,
                        Comment = approvalRequest.Comment
                    })
                    .ToListAsync();
            if (approvalRequests.Count <= 0)
                return NotFound("Approval Requests not found!");
            return Ok(approvalRequests);
        } catch (Exception e)
        {
            return BadRequest($"Error while fetching approval requests! {e.Message}");
        }
    }
    
    [HttpGet]
    [Route("getEmployeeApprovalRequests")]
    public async Task<IActionResult> getEmployeeApprovalRequests(string employeeId)
    {
        try
        {
            int.TryParse(employeeId, out int parsedId);
            var employee =
                await _outofofficeContext
                    .Employees
                    .Where(e => e.Id == parsedId)
                    .FirstOrDefaultAsync();
            if (employee == null)
                return NotFound("Employee with given id doesn't exists");
            var approvalRequests =
                await _outofofficeContext
                    .Approvalrequests
                    .Where(approvalRequest => approvalRequest.LeaveRequestNavigation.Employee == parsedId)
                    .Select(approvalRequest => new ApprovalRequestDTO
                    {
                        Id = approvalRequest.Id,
                        Approver = approvalRequest.Approver,
                        ApproverFullName = approvalRequest.Approver != null ? approvalRequest.ApproverNavigation.FullName : null,
                        LeaveRequest = approvalRequest.LeaveRequest,
                        Status = approvalRequest.Status,
                        Comment = approvalRequest.Comment
                    })
                    .ToListAsync();
            if (approvalRequests.Count <= 0)
                return NotFound("Approval Requests not found!");
            return Ok(approvalRequests);
        } catch (Exception e)
        {
            return BadRequest($"Error while fetching approval requests! {e.Message}");
        }
    }

    [HttpGet]
    [Route("approveRequest")]
    public async Task<IActionResult> approveRequest(string approvalRequestId, string approverId)
    {
        try
        {
            int.TryParse(approvalRequestId, out int parsedApprovalRequestId);
            int.TryParse(approverId, out int parsedApproverId);
            var approvalRequest =
                await _outofofficeContext
                    .Approvalrequests
                    .Where(e => e.Id == parsedApprovalRequestId)
                    .FirstOrDefaultAsync();
            if (approvalRequest.Status != "New")
                return BadRequest("Cannot approve other request than New");
            var approver =
                await _outofofficeContext
                    .Employees
                    .Where(e => e.Id == parsedApproverId)
                    .FirstOrDefaultAsync();
            if (approver == null || approvalRequest == null)
                return NotFound("Employe or request haven't been found!");

            var leaveRequest =
                await _outofofficeContext
                    .Leaverequests
                    .Where(e => e.Id == approvalRequest.LeaveRequest)
                    .FirstOrDefaultAsync();
            
            var daysDifference = leaveRequest.EndDate.DayNumber - leaveRequest.StartDate.DayNumber;

            var employee =
                await _outofofficeContext
                    .Employees
                    .Where(e => e.Id == leaveRequest.Employee)
                    .FirstOrDefaultAsync();
            if (employee.OutOfOfficeBalance - daysDifference <= 0)
                return BadRequest($"Insuficient ballance of {employee.FullName} to approve this request");

            employee.OutOfOfficeBalance -= daysDifference;
            approvalRequest.Status = "Approved";
            approvalRequest.Approver = approver.Id;
            leaveRequest.Status = "Approved";
            
            await _outofofficeContext.SaveChangesAsync();
            
            return Ok("Approval request has been approved");
        }catch (Exception e)
        {
            return BadRequest($"Error while approving requests! {e.Message}");
        }
    }

    [HttpGet]
    [Route("rejectRequest")]
    public async Task<IActionResult> rejectRequest(string approvalRequestId, string approverId, string? comment)
    {
        int.TryParse(approvalRequestId, out int parsedApprovalRequestId);
        int.TryParse(approverId, out int parsedApproverId);
        var approvalRequest =
            await _outofofficeContext
                .Approvalrequests
                .Where(e => e.Id == parsedApprovalRequestId)
                .FirstOrDefaultAsync();
        if (approvalRequest.Status != "New")
            return BadRequest("Cannot reject other request than New");
        var approver =
            await _outofofficeContext
                .Employees
                .Where(e => e.Id == parsedApproverId)
                .FirstOrDefaultAsync();
        if (approver == null || approvalRequest == null)
            return NotFound("Employe or request haven't been found!");
        
        var leaveRequest =
            await _outofofficeContext
                .Leaverequests
                .Where(e => e.Id == approvalRequest.LeaveRequest)
                .FirstOrDefaultAsync();
        
        approvalRequest.Status = "Rejected";
        approvalRequest.Approver = approver.Id;
        leaveRequest.Status = "Rejected";
        approvalRequest.Comment = comment;
        
        await _outofofficeContext.SaveChangesAsync();
        return Ok();
    }
}