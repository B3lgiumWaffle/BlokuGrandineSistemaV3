using Microsoft.AspNetCore.Http;

namespace BlokuGrandiniuSistema.DTOs
{
    public class SubmitContractFragmentDTO
    {
        public string Title { get; set; } = "";
        public string? Description { get; set; }
        public IFormFile? File { get; set; }
    }
}