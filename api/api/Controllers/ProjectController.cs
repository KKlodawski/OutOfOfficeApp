using api.DTO;
using api.models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers;

[ApiController]
[Route("[controller]")]
public class ProjectController : ControllerBase
{
    private readonly OutofofficeContext _outofofficeContext;

    public ProjectController(OutofofficeContext outofofficeContext)
    {
        _outofofficeContext = outofofficeContext;
    }

    [HttpGet]
    [Route("getProjects")]
    public async Task<IActionResult> getProjects()
    {
        try{
            var projects =
                await _outofofficeContext
                    .Projects
                    .Select(project => new ProjectDTO()
                    {
                        Id = project.Id,
                        ProjectType = project.ProjectType,
                        StartDate = project.StartDate,
                        EndDate = project.EndDate,
                        ProjectManager = project.ProjectManager,
                        Comment = project.Comment,
                        Status = project.Status
                    }).ToListAsync();
            
            if (projects.Count <= 0)
                return NotFound("Projects not found!");
            return Ok(projects);
        }
        catch (Exception e)
        {
            return BadRequest($"Error while adding employee! {e.Message}");
        }
    }

    [HttpGet]
    [Route("getProjectsByEmployee")]
    public async Task<IActionResult> getProjectsByEmployee(string employeeId)
    {
        try
        {
            int.TryParse(employeeId, out int parsedId);
            var projects =
                await _outofofficeContext
                    .Projects
                    .Where(e => e.Employees.Any(ee => ee.Id == parsedId))
                    .Select(project => new ProjectDTO()
                    {
                        Id = project.Id,
                        ProjectType = project.ProjectType,
                        StartDate = project.StartDate,
                        EndDate = project.EndDate,
                        ProjectManager = project.ProjectManager,
                        Comment = project.Comment,
                        Status = project.Status
                    }).ToListAsync();
            if (projects.Count <= 0)
                return NotFound("Projects not found!");
            return Ok(projects);
        }
        catch (Exception e)
        {
            return BadRequest($"Error while loading employee projects! {e.Message}");
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
    [Route("changeProjectStatusById")]
    public async Task<IActionResult> changeProjectStatusById(string id)
    {
        try{
            int.TryParse(id, out int parsedId);
            var projectExists = await _outofofficeContext.Employees.AnyAsync(project => project.Id == parsedId);
            if (!projectExists)
                return BadRequest("Project with given id doesn't exists!");
            
            var project = await _outofofficeContext.Projects.FirstOrDefaultAsync(project => project.Id == parsedId);
            if (project.Status.Equals("Active")) project.Status = "Inactive";
            else project.Status = "Active";
            _outofofficeContext.Projects.Update(project);
            await _outofofficeContext.SaveChangesAsync();
            return Ok($"Project status has been changed!");
        }
        catch (Exception e)
        {
            return BadRequest($"Error while adding employee! {e.Message}");
        }
        
    }
    
    [HttpGet]
    [Route("getProjectById")]
    public async Task<IActionResult> getProjectById(string id)
    {
        try{
            int.TryParse(id, out int parsedId);
            var projectExists = await _outofofficeContext.Projects.AnyAsync(project => project.Id == parsedId);
            if (!projectExists)
                return BadRequest("Employee with given id doesn't exists!");
            var project =
                await _outofofficeContext.Projects
                    .Where(e => e.Id == parsedId)
                    .Select(project => new ProjectDTO()
                    {
                        Id = project.Id,
                        ProjectType = project.ProjectType,
                        StartDate = project.StartDate,
                        EndDate = project.EndDate,
                        ProjectManager = project.ProjectManager,
                        Comment = project.Comment,
                        Status = project.Status,
                        
                    }).FirstOrDefaultAsync();
            return Ok(project);
        }
        catch (Exception e)
        {
            return BadRequest($"Error while adding employee! {e.Message}");
        }
    }
    
    [HttpPost]
    [Route("editProject")]
    public async Task<IActionResult> editProject([FromBody] ProjectDTO project)
    {
        try
        {
            var projectExists = await  _outofofficeContext.Projects.AnyAsync(e => e.Id == project.Id);
            if (!projectExists)
                return NotFound($"Project with given id doesn't exists!");
            
            var projectToEdit = await _outofofficeContext.Projects.FirstOrDefaultAsync(e => e.Id == project.Id);
            projectToEdit.Id = project.Id;
            projectToEdit.ProjectType = project.ProjectType;
            projectToEdit.StartDate = project.StartDate;
            projectToEdit.EndDate = project.EndDate;
            projectToEdit.ProjectManager = project.ProjectManager;
            projectToEdit.Comment = project.Comment;
            projectToEdit.Status = project.Status;

            _outofofficeContext.Projects.Update(projectToEdit);
            await _outofofficeContext.SaveChangesAsync();
            return Ok($"Project has been modified!");
            
        }
        catch (Exception e)
        {
            return BadRequest($"Error while trying to edit project! {e.Message}");
        }
    }
    
    [HttpPost]
    [Route("addProject")]
    public async Task<IActionResult> addProject([FromBody] ProjectDTO project)
    {
        try
        {
            var addedProject = await _outofofficeContext.Projects.AddAsync(new Project
            {
                ProjectType = project.ProjectType,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                ProjectManager = project.ProjectManager,
                Comment = project.Comment,
                Status = project.Status,
            });
                
            await _outofofficeContext.SaveChangesAsync();
            return Ok("Project added successfully");
        }
        catch (Exception e)
        {
            return BadRequest($"Error while adding project! {e.Message}");
        }
        
    }
}