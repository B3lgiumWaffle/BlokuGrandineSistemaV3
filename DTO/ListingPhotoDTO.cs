namespace BlokuGrandiniuSistema.Models
{
    public class ListingPhotoDTO
    {
        public int photoId { get; set; }
        public int listingId { get; set; }
        public string PhotoUrl { get; set; } = "";
        public bool IsPrimary { get; set; }
        public DateTime UploadTime { get; set; }

        // optional navigation
        public b_listing? Listing { get; set; }
    }

    public class UploadListingPhotosDto
    {
        public List<IFormFile> Files { get; set; } = new();
        public int PrimaryIndex { get; set; } = 0;
    }
}
