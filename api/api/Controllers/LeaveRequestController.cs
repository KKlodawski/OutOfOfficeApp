using Microsoft.AspNetCore.Mvc;
using api.models;
using api.DTO;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers;

[ApiController]
[Route("[controller]")]
public class LeaveRequestController : ControllerBase
{
    private readonly OutofofficeContext _outofofficeContext;

    public LeaveRequestController(OutofofficeContext outofofficeContext)
    {
        _outofofficeContext = outofofficeContext;
    }


    [HttpGet]
    [Route("getLeaveRequests")]
    public async Task<IActionResult> getLeaveRequests()
    {
        var leaveRequests =
            await _outofofficeContext
                .Leaverequests
                .Select(leaverequest => new LeaveRequestDTO
                {
                    Id = leaverequest.Id,
                    EmployeeId = leaverequest.EmployeeNavigation.Id,
                    EmployeeFullName = leaverequest.EmployeeNavigation.FullName,
                    AbsenceReason = leaverequest.AbsenceReason,
                    StartDate = leaverequest.StartDate,
                    EndDate = leaverequest.EndDate,
                    Comment = leaverequest.Comment,
                    Status = leaverequest.Status
                }).ToListAsync();
        
        
        return Ok(leaveRequests);
    }

    [HttpGet]
    [Route("getLeaveRequestById")]
    public async Task<IActionResult> getLeaveRequestById(string id)
    {
        try
        {
            int.TryParse(id, out int parsedId);
            var leaveRequestExists = await _outofofficeContext.Leaverequests.AnyAsync(lr => lr.Id == parsedId);
            if (!leaveRequestExists)
                return NotFound("Leave Request with given id doesn't exists!");

            var leaveRequest = 
                await _outofofficeContext
                    .Leaverequests
                    .Where(leaverequest => leaverequest.Id == parsedId)
                    .Select(leaverequest => new LeaveRequestDTO
                    {
                        Id = leaverequest.Id,
                        EmployeeId = leaverequest.EmployeeNavigation.Id,
                        EmployeeFullName = leaverequest.EmployeeNavigation.FullName,
                        AbsenceReason = leaverequest.AbsenceReason,
                        StartDate = leaverequest.StartDate,
                        EndDate = leaverequest.EndDate,
                        Comment = leaverequest.Comment,
                        Status = leaverequest.Status
                    }).FirstOrDefaultAsync();

            return Ok(leaveRequest);
        }   
        catch (Exception e)
        {
            return BadRequest($"Error while fetching leave request! {e.Message}");
        }
    } 
    
    [HttpGet]
    [Route("getLeaveRequestByEmployee")]
    public async Task<IActionResult> getLeaveRequestByEmployee(string employeeId)
    {
        try
        {
            int.TryParse(employeeId, out int parsedId);
            var leaveRequests = 
                await _outofofficeContext
                    .Leaverequests
                    .Where(leaverequest => leaverequest.EmployeeNavigation.Id == parsedId)
                    .Select(leaverequest => new LeaveRequestDTO
                    {
                        Id = leaverequest.Id,
                        EmployeeId = leaverequest.EmployeeNavigation.Id,
                        EmployeeFullName = leaverequest.EmployeeNavigation.FullName,
                        AbsenceReason = leaverequest.AbsenceReason,
                        StartDate = leaverequest.StartDate,
                        EndDate = leaverequest.EndDate,
                        Comment = leaverequest.Comment,
                        Status = leaverequest.Status
                    }).ToListAsync();
            if (leaveRequests.Count <= 0)
                return NotFound("Leave Requests not found!");
            return Ok(leaveRequests);
        }   
        catch (Exception e)
        {
            return BadRequest($"Error while fetching leave request! {e.Message}");
        }
    }

    [HttpPost]
    [Route("addLeaveRequest")]
    public async Task<IActionResult> addLeaveRequest([FromBody] LeaveRequestDTO leaveRequest)
    {
        try
        {
            var addedProject = await _outofofficeContext.Leaverequests.AddAsync(new Leaverequest
            {
                Employee = leaveRequest.EmployeeId,
                AbsenceReason = leaveRequest.AbsenceReason,
                StartDate = leaveRequest.StartDate,
                EndDate = leaveRequest.EndDate,
                Comment = leaveRequest.Comment,
                Status = leaveRequest.Status
            });
                
            await _outofofficeContext.SaveChangesAsync();
            return Ok("Project added successfully");
        }
        catch (Exception e)
        {
            return BadRequest($"Error while adding project! {e.Message}");
        }
        
    }
    
    [HttpPost]
    [Route("editLeaveRequest")]
    public async Task<IActionResult> editLeaveRequest([FromBody] LeaveRequestDTO leaveRequest)
    {
        try
        {
            var leaveRequestExists = await  _outofofficeContext.Leaverequests.AnyAsync(e => e.Id == leaveRequest.Id);
            if (!leaveRequestExists)
                return NotFound($"Leave Request with given id doesn't exists!");
            
            var leaveRequestToEdit = await _outofofficeContext.Leaverequests.FirstOrDefaultAsync(e => e.Id == leaveRequest.Id);
            leaveRequestToEdit.Id = leaveRequest.Id;
            leaveRequestToEdit.Employee = leaveRequest.EmployeeId;
            leaveRequestToEdit.AbsenceReason = leaveRequest.AbsenceReason;
            leaveRequestToEdit.StartDate = leaveRequest.StartDate;
            leaveRequestToEdit.EndDate = leaveRequest.EndDate;
            leaveRequestToEdit.Comment = leaveRequest.Comment;
            leaveRequestToEdit.Status = leaveRequest.Status;

            _outofofficeContext.Leaverequests.Update(leaveRequestToEdit);
            await _outofofficeContext.SaveChangesAsync();
            return Ok($"Leave Request has been modified!");
            
        }
        catch (Exception e)
        {
            return BadRequest($"Error while trying to edit project! {e.Message}");
        }
    }

    [HttpGet]
    [Route("submitRequest")]
    public async Task<IActionResult> submitRequest(string leaveRequestId)
    {
        try
        {
            int.TryParse(leaveRequestId, out int parsedId);
            var leaveRequest = await _outofofficeContext.Leaverequests.FirstOrDefaultAsync(e => e.Id == parsedId);
            if (leaveRequest == null)
                return NotFound("Leave Request with given id doesn't exists!");
            if (leaveRequest.Status != "New")
                return Conflict("Leave request is already Submitted or Cancelled");

            leaveRequest.Status = "Submitted";
            _outofofficeContext.Leaverequests.Update(leaveRequest);
            await _outofofficeContext.SaveChangesAsync();

            var approvalRequest = new Approvalrequest
            {
                Approver = null,
                LeaveRequest = leaveRequest.Id,
                Status = "New",
                Comment = null
            };
            await _outofofficeContext.Approvalrequests.AddAsync(approvalRequest);
            await _outofofficeContext.SaveChangesAsync();


            var requester = 
                await _outofofficeContext
                    .Employees
                    .Where(e => e.Id == leaveRequest.Employee)
                    .FirstOrDefaultAsync();
            var requesterPartner = 
                await _outofofficeContext
                    .Employees
                    .Where(e => requester != null && e.Id == requester.PeoplePartner)
                    .FirstOrDefaultAsync();
            if (requesterPartner != null) approvalRequest.Employees.Add(requesterPartner);
            var projs =
                await _outofofficeContext
                    .Projects
                    .Where(e => requester != null && e.Employees.Contains(requester))
                    .ToListAsync();
            foreach (var project in projs)
            {
                var requesterProjectManagers =
                    await _outofofficeContext
                        .Employees
                        .Where(e => e.Id == project.ProjectManager)
                        .FirstOrDefaultAsync();
                if(requesterProjectManagers != null) approvalRequest.Employees.Add(requesterProjectManagers);
            }
            
            await _outofofficeContext.SaveChangesAsync();

            return Ok("Request has been submitted");
        }
        catch (Exception e)
        {
            return BadRequest($"Error while trying to submit a request! {e.Message}");
        }
        
    }

    [HttpGet]
    [Route("cancelRequest")]
    public async Task<IActionResult> cancekRequest(string leaveRequestId)
    {
        int.TryParse(leaveRequestId, out int parsedId);
        var leaveRequest = 
            await _outofofficeContext
                .Leaverequests
                .FirstOrDefaultAsync(e => e.Id == parsedId);
        if (leaveRequest == null)
            return NotFound("Leave Request with given id doesn't exists!");
        if (leaveRequest.Status == "Cancelled")
            return BadRequest("Leave request is already Cancelled");

        leaveRequest.Status = "Cancelled";
        
        var approvalRequest =
            await _outofofficeContext
                .Approvalrequests
                .Where(e => e.LeaveRequest == leaveRequest.Id)
                .FirstOrDefaultAsync();
        if (approvalRequest != null)
        {
            approvalRequest.Status = "Cancelled";
        }
        
        await _outofofficeContext.SaveChangesAsync();
        return Ok();
    }
}