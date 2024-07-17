namespace api.DTO;

public class EmployeeDTO
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public string Subdivision { get; set; } = null!;

    public string Position { get; set; } = null!;

    public string Status { get; set; } = null!;

    public int? PeoplePartner { get; set; }

    public int OutOfOfficeBalance { get; set; }

    public string? Photo { get; set; }

}