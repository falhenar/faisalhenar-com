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
  color  -> true shows the album's photos in their original color; false
            (default) applies the site's black & white treatment.
  photos -> array of filenames that live inside photos/<slug>/

  ORDER MATTERS. The order of this array is the order albums appear on the
  photography index, and it is also the reading order: the end of each album
  links to the next one below it here. Reordering these blocks reorders the
  path a visitor takes through the work, so do it deliberately. The last
  album has no "next" — it ends on a link back to all albums.
*/

const ALBUMS = [
  {
    slug: "first-roll",
    title: "Vietnam Streets",
    color: false,
    photos: [
      "photos/first-roll/P6030666.jpg",
      "photos/first-roll/P6241167.jpg",
      "photos/first-roll/P6271115.jpg",
      "photos/first-roll/P6281299.jpg",
      "photos/first-roll/P6281389.jpg",
      "photos/first-roll/P6281404.jpg",
      "photos/first-roll/P6301905.jpg",
      "photos/first-roll/P6301922.jpg",
      "photos/first-roll/P6271096.jpg"
    ]
  },
  {
    slug: "vietnam-streets-color",
    title: "Vietnam Streets, in Color",
    color: true,
    photos: [
      "photos/vietnam-streets-color/P6050611.jpg",
      "photos/vietnam-streets-color/P6080541.jpg",
      "photos/vietnam-streets-color/P6080906.jpg",
      "photos/vietnam-streets-color/P6080910.jpg",
      "photos/vietnam-streets-color/P6250883.jpg",
      "photos/vietnam-streets-color/P6271105.jpg"
    ]
  },
  {
    slug: "suriname-streets",
    title: "Suriname Streets",
    color: false,
    photos: [
      "photos/suriname-streets/P7231377.jpg",
      "photos/suriname-streets/P7231325.jpg",
      "photos/suriname-streets/P7231351.jpg",
      "photos/suriname-streets/P7231574.jpg",
      "photos/suriname-streets/P7231379.jpg",
      "photos/suriname-streets/P7231561.jpg",
      "photos/suriname-streets/P7231512.jpg",
      "photos/suriname-streets/Busses20260723.jpg",
      "photos/suriname-streets/Kwatta-markt20260805-01.jpg",
      "photos/suriname-streets/kwattamarkt20260805-2.jpg"
    ]
  }
];
