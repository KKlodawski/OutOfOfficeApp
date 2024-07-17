namespace api.DTO;

public class ApprovalRequestDTO
{
    public int Id { get; set; }
    public int? Approver { get; set; }
    public string? ApproverFullName { get; set; }
    public int LeaveRequest { get; set; }
    public string Status { get; set; }
    public string? Comment { get; set; }
}