const nextConfig = {
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: "/products/oando-chairs",
        destination: "/products/seating",
        permanent: false,
      },
      {
        source: "/products/oando-chairs/:slug",
        destination: "/products/seating/:slug",
        permanent: false,
      },
      {
        source: "/products/oando-other-seating",
        destination: "/products/seating",
        permanent: false,
      },
      {
        source: "/products/oando-other-seating/:slug",
        destination: "/products/seating/:slug",
        permanent: false,
      },
      {
        source: "/products/oando-seating",
        destination: "/products/seating",
        permanent: false,
      },
      {
        source: "/products/oando-workstations",
        destination: "/products/workstations",
        permanent: false,
      },
      {
        source: "/products/oando-tables",
        destination: "/products/tables",
        permanent: false,
      },
      {
        source: "/products/oando-storage",
        destination: "/products/storages",
        permanent: false,
      },
      {
        source: "/products/oando-soft-seating",
        destination: "/products/soft-seating",
        permanent: false,
      },
      {
        source: "/products/oando-collaborative",
        destination: "/products/soft-seating",
        permanent: false,
      },
      {
        source: "/products/oando-educational",
        destination: "/products/education",
        permanent: false,
      },
      {
        source: "/products/chairs-mesh",
        destination: "/products/seating",
        permanent: false,
      },
      {
        source: "/products/chairs-others",
        destination: "/products/seating",
        permanent: false,
      },
      {
        source: "/products/cafe-seating",
        destination: "/products/seating",
        permanent: false,
      },
      {
        source: "/products/desks-cabin-tables",
        destination: "/products/tables",
        permanent: false,
      },
      {
        source: "/products/meeting-conference-tables",
        destination: "/products/tables",
        permanent: false,
      },
      {
        source: "/products/others-1",
        destination: "/products/soft-seating",
        permanent: false,
      },
      {
        source: "/products/others-2",
        destination: "/products/seating",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "catalogindia.in" },
      { protocol: "https", hostname: "static.wixstatic.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.prod.website-files.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

module.exports = nextConfig;
