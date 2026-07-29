/*
  ALBUMS CONFIG
  -------------
  This is the only file you need to touch to add or change albums.

  To add a new album:
  1. Create a folder inside /photos with your album's slug name,
     e.g. photos/my-new-album/
  2. Put your image files in that folder (jpg or png, any name).
  3. Copy one of the blocks below, change the values, and list your
     image filenames in the "photos" array.

  slug   -> used in the URL, e.g. "quiet-mornings" -> album.html?a=quiet-mornings
            use lowercase letters, numbers and hyphens only, no spaces
  title  -> the name shown on the site
  photos -> array of filenames that live inside photos/<slug>/
*/

const ALBUMS = [
  {
    slug: "first-roll",
    title: "First Roll",
    photos: [
      "photos/first-roll/P6030666.jpg",
      "photos/first-roll/P6241167.jpg",
      "photos/first-roll/P6271115.jpg",
      "photos/first-roll/P6281299.jpg",
      "photos/first-roll/P6281389.jpg",
      "photos/first-roll/P6281404.jpg",
      "photos/first-roll/P6301905.jpg",
      "photos/first-roll/P6301922.jpg"
    ]
  },
  {
    slug: "quiet-mornings",
    title: "Quiet Mornings",
    photos: [
      "https://picsum.photos/id/1011/1200/1500",
      "https://picsum.photos/id/1015/1200/1500",
      "https://picsum.photos/id/1016/1200/1500",
      "https://picsum.photos/id/1021/1200/1500",
      "https://picsum.photos/id/1025/1200/1500",
      "https://picsum.photos/id/1031/1200/1500"
    ]
  },
  {
    slug: "kampong-streets",
    title: "Kampong Streets",
    photos: [
      "photos/kampong-streets/01.jpg",
      "photos/kampong-streets/02.jpg",
      "photos/kampong-streets/03.jpg",
      "photos/kampong-streets/04.jpg",
      "photos/kampong-streets/05.jpg"
    ]
  },
  {
    slug: "portraits",
    title: "Portraits",
    photos: [
      "https://picsum.photos/id/64/1200/1500",
      "https://picsum.photos/id/91/1200/1500",
      "https://picsum.photos/id/177/1200/1500",
      "https://picsum.photos/id/338/1200/1500",
      "https://picsum.photos/id/342/1200/1500",
      "https://picsum.photos/id/453/1200/1500",
      "https://picsum.photos/id/501/1200/1500",
      "https://picsum.photos/id/823/1200/1500",
      "https://picsum.photos/id/912/1200/1500"
    ]
  }
];
