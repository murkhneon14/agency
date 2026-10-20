const numberedProjects = (type, numbers) =>
  numbers.map((number, index) => {
    return {
      id: `${type}-${number}`,
      label: `${type.replaceAll("-", " ")} project ${index + 1}`,
      src: `/projects/${type}/project${number}.avif`,
    };
  });

const mobileAppProjects = numberedProjects(
  "mobile-apps",
  Array.from({ length: 26 }, (_, index) => index + 1),
);

const mobileApps = [
  {
    id: "find-my-tutor-app-store",
    label: "Find My Tutor mobile app",
    href: "https://apps.apple.com/in/app/find-my-tutor/id6755203370",
    src: "https://image.thum.io/get/width/1200/crop/1000/noanimate/https://apps.apple.com/in/app/find-my-tutor/id6755203370",
  },
  mobileAppProjects[0],
  {
    id: "find-my-tutor-google-play",
    label: "Find My Tutor Android app",
    href: "https://play.google.com/store/apps/details?id=com.findmytutor.app",
    src: "/projects/mobile-apps/find-my-tutor-google-play.png",
  },
  {
    id: "devlog-google-play-search",
    label: "Devlog apps on Google Play",
    href: "https://play.google.com/store/search?q=devlog&c=apps",
    src: "/projects/mobile-apps/devlog-google-play.png",
  },
  {
    id: "autoreply-google-play",
    label: "AutoReply — AI Smart Message",
    href: "https://play.google.com/store/apps/details?id=com.matrix.autoreply",
    src: "https://image.thum.io/get/width/1200/crop/1000/noanimate/https://play.google.com/store/apps/details?id=com.matrix.autoreply",
  },
  ...mobileAppProjects.slice(1),
];

const webApps = numberedProjects(
  "web-apps",
  Array.from({ length: 12 }, (_, index) => index + 1),
);

const featuredWebsites = [
  {
    id: "lekhi-tutorials",
    label: "The Lekhi Tutorials",
    href: "https://www.thelekhitutorials.in/",
    src: "/projects/websites/lekhi-tutorials.png",
  },
  {
    id: "find-my-tutor",
    label: "FindMyTutor — find your perfect tutor",
    href: "https://www.findmytutor.app/",
    src: "/projects/websites/find-my-tutor.png",
  },
  {
    id: "postcard-vert",
    label: "Postcard. — digital letters and postcards",
    href: "https://postcard-vert.vercel.app/",
    src: "/projects/websites/postcard-vert.png",
  },
  {
    id: "searchiva",
    label: "Searchiva — AI search optimization",
    href: "https://searchiva.100xsolutions.in/",
    src: "https://image.thum.io/get/width/1200/crop/1000/noanimate/https://searchiva.100xsolutions.in/",
  },
];

const websites = [
  ...featuredWebsites,
  ...numberedProjects("websites", [12, 27]),
];

const branding = numberedProjects(
  "branding",
  [2, 3, 4, 6, 8, 9],
);

export const projectCategories = [
  { slug: "mobile-apps", label: "Mobile Apps", projects: mobileApps },
  { slug: "web-apps", label: "Web Apps", projects: webApps },
  { slug: "websites", label: "Websites", projects: websites },
  { slug: "branding", label: "Branding", projects: branding },
];

export const brandMarks = [
  { name: "contra", src: "/projects/brands/contra.svg" },
  { name: "opptics", src: "/projects/brands/opptics.svg" },
  { name: "cluely", src: "/projects/brands/cluely.svg" },
  { name: "terac", src: "/projects/brands/terac.svg" },
  { name: "time.fun", src: "/projects/brands/timefun.svg" },
  { name: "bags", src: "/projects/brands/bags.svg" },
];
