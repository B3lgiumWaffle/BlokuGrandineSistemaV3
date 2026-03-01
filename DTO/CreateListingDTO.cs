using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace BlokuGrandiniuSistema.DTO
{
    public class CreateListingDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal PriceTo { get; set; }
        public decimal PriceFrom { get; set; }
        public string CompletionTime { get; set; }

        public int CategoryId { get; set; }
    }
}
