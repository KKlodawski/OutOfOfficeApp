namespace api.DTO;

public class ProjectDTO
{
    public int Id { get; set; }

    public string ProjectType { get; set; } = null!;

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public int ProjectManager { get; set; }

    public string? Comment { get; set; }

    public string Status { get; set; } = null!; 

}