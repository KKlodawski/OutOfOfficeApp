using api.DTO;
using api.models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers;


[ApiController]
[Route("[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly OutofofficeContext _outofofficeContext;

    public EmployeeController(OutofofficeContext outofofficeContext)
    {
        _outofofficeContext = outofofficeContext;
    }

    [HttpGet]
    [Route("getEmployees")]
    public async Task<IActionResult> getEmployees()
    {
        try{
            var employees =
                await _outofofficeContext
                    .Employees
                    .Select(employee =>  new EmployeeDTO
                        {
                        Id = employee.Id,
                        FullName = employee.FullName,
                        Subdivision = employee.Subdivision,
                        Position = employee.Position,
                        Status = employee.Status,
                        PeoplePartner = employee.PeoplePartner,
                        OutOfOfficeBalance = employee.OutOfOfficeBalance,
                        Photo = employee.Photo,
                        }
                    ).ToListAsync();
            
            return Ok(employees);
        }
        catch (Exception e)
        {
            return BadRequest($"Error while adding employee! {e.Message}");
        }
        
    }

    [HttpGet]
    [Route("getEmployeesByPosition")]
    public async Task<IActionResult> getEmployeesByPosition(string position)
    {
        try{
            var employees =
                await _outofofficeContext.Employees
                    .Where(e => e.Position == position)
                    .Select(employee => new EmployeeDTO
                    {
                        Id = employee.Id,
                        FullName = employee.FullName,
                        Subdivision = employee.Subdivision,
                        Position = employee.Position,
                        Status = employee.Status,
                        PeoplePartner = employee.PeoplePartner,
                        OutOfOfficeBalance = employee.OutOfOfficeBalance,
                        Photo = employee.Photo,
                    }).ToListAsync();
            
            if (employees.Count <= 0)
                return NotFound("Projects not found!");
            return Ok(employees);
        }
        catch (Exception e)
        {
            return BadRequest($"Error while adding employee! {e.Message}");
        }
    }

    [HttpGet]
    [Route("changeEmployeeStatusById")]
    public async Task<IActionResult> changeEmployeeStatusById(string id)
    {
        try{
            int.TryParse(id, out int parsedId);
            var employeeExists = await _outofofficeContext.Employees.AnyAsync(employee => employee.Id == parsedId);
            if (!employeeExists)
                return BadRequest("Employee with given id doesn't exists!");
            
            var employee = await _outofofficeContext.Employees.FirstOrDefaultAsync(employee => employee.Id == parsedId);
            if (employee.Status.Equals("Active")) employee.Status = "Inactive";
            else employee.Status = "Active";
            _outofofficeContext.Employees.Update(employee);
            await _outofofficeContext.SaveChangesAsync();
            return Ok($"Employee's {employee.FullName} status has been changed!");
        }
        catch (Exception e)
        {
            return BadRequest($"Error while adding employee! {e.Message}");
        }
        
    }
    
    [HttpGet]
    [Route("getEmployeesById")]
    public async Task<IActionResult> getEmployeesById(string id)
    {
        try {
            int.TryParse(id, out int parsedId);
            var employeeExists = await _outofofficeContext.Employees.AnyAsync(employee => employee.Id == parsedId);
            if (!employeeExists)
                return BadRequest("Employee with given id doesn't exists!");
            var employee =
                await _outofofficeContext.Employees
                    .Where(e => e.Id == parsedId)
                    .Select(employee => new EmployeeDTO
                    {
                        Id = employee.Id,
                        FullName = employee.FullName,
                        Subdivision = employee.Subdivision,
                        Position = employee.Position,
                        Status = employee.Status,
                        PeoplePartner = employee.PeoplePartner,
                        OutOfOfficeBalance = employee.OutOfOfficeBalance,
                        Photo = employee.Photo,
                    }).FirstOrDefaultAsync();
            return Ok(employee);
        }
        catch (Exception e)
        {
            return BadRequest($"Error while adding employee! {e.Message}");
        }
    }

    [HttpPost]
    [Route("addEmployee")]
    public async Task<IActionResult> addEmployee([FromForm] EmployeeDTO employee, [FromForm] IFormFile photoFile)
    {
        try
        {
            var addedEmployee = await _outofofficeContext.Employees.AddAsync(new Employee
                {
                    FullName = employee.FullName,
                    Subdivision = employee.Subdivision,
                    Position = employee.Position,
                    Status = employee.Status,
                    PeoplePartner = employee.PeoplePartner,
                    OutOfOfficeBalance = employee.OutOfOfficeBalance,
                    Photo = employee.Photo,
            });
                
            await _outofofficeContext.SaveChangesAsync();
            
            if (photoFile != null && photoFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
                var uniqueFileName = $"employeePhoto{addedEmployee.Entity.Id}{Path.GetExtension(photoFile.FileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await photoFile.CopyToAsync(stream);
                }

                addedEmployee.Entity.Photo = Path.Combine("uploads", uniqueFileName);
            }

            _outofofficeContext.Employees.Update(addedEmployee.Entity);
            await _outofofficeContext.SaveChangesAsync();
            
            return Ok("Employee added successfully");
        }
        catch (Exception e)
        {
            return BadRequest($"Error while adding employee! {e.Message}");
        }
        
    }

    [HttpPost]
    [Route("editEmployee")]
    public async Task<IActionResult> editEmployee([FromForm] EmployeeDTO employee, [FromForm] IFormFile? photoFile)
    {
        try
        {
            var employeeExists = await  _outofofficeContext.Employees.AnyAsync(e => e.Id == employee.Id);
            if (!employeeExists)
                return NotFound($"Employee with given id doesn't exists!");
            
            var employeeToEdit = await _outofofficeContext.Employees.FirstOrDefaultAsync(e => e.Id == employee.Id);
            employeeToEdit.FullName = employee.FullName;
            employeeToEdit.Subdivision = employee.Subdivision;
            employeeToEdit.Position = employee.Position;
            employeeToEdit.Status = employee.Status;
            employeeToEdit.PeoplePartner = employee.PeoplePartner;
            employeeToEdit.OutOfOfficeBalance = employee.OutOfOfficeBalance;
            employeeToEdit.Photo = employee.Photo;
            
            if (photoFile != null && photoFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
                var uniqueFileName = $"employeePhoto{employeeToEdit.Id}{Path.GetExtension(photoFile.FileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await photoFile.CopyToAsync(stream);
                }

                employeeToEdit.Photo = Path.Combine("uploads", uniqueFileName);
            }
            
            _outofofficeContext.Employees.Update(employeeToEdit);
            await _outofofficeContext.SaveChangesAsync();
            return Ok($"Employee {employeeToEdit.FullName} has been modified!");
            
        }
        catch (Exception e)
        {
            return BadRequest("Error while trying to edit employee!");
        }
    }

    [HttpGet]
    [Route("getPhoto")]
    public async Task<IActionResult> getPhoto(string filename)
    {
        try
        {
            var normalizedFilePath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), filename));

            if (!System.IO.File.Exists(normalizedFilePath))
            {
                return NotFound("File not found.");
            }

            var fileBytes = System.IO.File.ReadAllBytes(normalizedFilePath);
            var contentType = GetContentType(normalizedFilePath); // Get content type based on file extension
            return File(fileBytes, contentType);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet]
    [Route("assignToProject")]
    public async Task<IActionResult> assignToProject([FromQuery]int projectId, [FromQuery]int employeeId)
    {
        try
        {
            var employee = await _outofofficeContext.Employees.FirstOrDefaultAsync(e => e.Id == employeeId);
            if (employee == null)
                return NotFound($"Employee with given id doesn't exists! {employeeId}");
            var project = await _outofofficeContext.Projects.FirstOrDefaultAsync(e => e.Id == projectId);
            if (project == null)
                return NotFound($"Project with given id doesn't exists! {projectId}");

            employee.Projects.Add(project);

            await _outofofficeContext.SaveChangesAsync();
            
            return Ok($"Employee with ID {employeeId} has been assigned to Project with ID {projectId}.");

        }   
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    private string GetContentType(string filePath)
    {
        var fileExtension = Path.GetExtension(filePath)?.ToLowerInvariant();

        switch (fileExtension)
        {
            case ".jpg":
            case ".jpeg":
                return "image/jpeg";
            case ".png":
                return "image/png";
            case ".gif":
                return "image/gif";
            // Add more cases as needed for other file types
            default:
                return "application/octet-stream"; // Default to binary stream if content type is unknown
        }
    }
    
    
}