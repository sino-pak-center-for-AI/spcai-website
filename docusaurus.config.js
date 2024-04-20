// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { themes } = require("prism-react-renderer");
const lightTheme = themes.github;
const darkTheme = themes.dracula;

const GNOSIS_SHORT = "GRC";
const GNOSIS_TITLE = "Gnosis Research Center";
const GNOSIS_DESCRIPTION = `
We conduct research in High-Performance Computing (HPC) memory and storage systems, especially in the design and prototype development of scalable software systems. 
Our current emphasis is on a scalable system software for data management and data access and on having a better understanding of data-centric systems development.
`;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: GNOSIS_TITLE,
  tagline: GNOSIS_DESCRIPTION,
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://osama347.github.io/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "spcai",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "Spcai PAF-IAST", // Usually your GitHub org/user name.
  projectName: "Spcai", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./docusaurus.sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        gtag: {
          trackingID: "G-9SXDPLSLB2",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/social-card.png",
      metadata: [
        {
          name: "description",
          content:
            "Discover our research center's work in HPC memory and storage systems, emphasizing scalable software, data management, and data-centric system development.",
        },
        {
          name: "keywords",
          content: [
            "high-performance computing (hpc)",
            "memory and storage systems",
            "scalable software systems",
            "data management",
            "data-centric systems",
            "research center",
            "scalable system software",
            "technology research",
            "computational research",
            "innovative technology",
            "scientific research",
          ].join(", "),
        },
      ],
      navbar: {
        style: "dark",
        title: GNOSIS_TITLE,
        logo: {
          alt: GNOSIS_TITLE,
          src: "img/logo.png",
        },
        items: [
          {
            label: "Gnosis",
            position: "left",
            items: [
              {
                to: "/about",
                label: "About",
              },
              {
                to: "/members",
                label: "Members",
              },
              {
                to: "/network",
                label: "Network",
              },
              {
                to: "/contact",
                label: "Contact",
              },
            ],
          },
          {
            label: "Research",
            position: "left",
            items: [
              {
                to: "/research/projects",
                label: "Projects",
              },
              {
                to: "/research/patents",
                label: "Patents",
              },
              {
                to: "/resources/hardware-overview",
                label: "Hardware Overview",
              },
            ],
          },
          {
            to: "/publications",
            label: "Publications",
            position: "left",
          },
          // {
          //   to: "/blog",
          //   label: "Blog",
          //   position: "left",
          // },
          {
            type: "docSidebar",
            label: "Tutorials",
            sidebarId: "tutorialSidebar",
            position: "right",
          },
          {
            label: "GitHub",
            href: "https://github.com/grc-iit",
            position: "right",
          },
        ],
      },
      footer: {
        // style: "dark",
        links: [
          {
            title: GNOSIS_TITLE,
            items: [
              {
                html: `
                  <p>
                    Stuart Building <br />
                    Room 112i and 010 <br />
                    10 W. 31st Street <br />
                    Chicago, Illinois 60616
                  </p>
                `,
              },
              {
                html: `
                  <p>
                    Email: <a href="mailto:grc@iit.edu" target="_blank" rel="noopener noreferrer">grc@iit.edu</a> <br />
                    Phone: <a href="tel:3125676885" target="_blank" rel="noopener noreferrer">+1 312 567 6885</a>
                  </p>
                `,
              },
            ],
          },
          {
            title: "Featured Projects",
            items: [
              {
                label: "ChronoLog",
                to: "/research/projects/chronolog",
              },
              {
                label: "Labios",
                to: "/research/projects/labios",
              },
              {
                label: "Coeus",
                to: "/research/projects/coeus",
              },
              {
                label: "Hermes",
                to: "/research/projects/hermes",
              },
            ],
          },
          {
            title: "Tutorials",
            items: [
              {
                label: "Linux Introduction",
                to: "/docs/category/linux-introduction",
              },
              {
                label: "Installing HPC Software",
                to: "/docs/category/installing-hpc-software",
              },
              {
                label: "Important Environment Variables",
                to: "/docs/category/important-environment-variables",
              },
              {
                label: "C++ Introduction",
                to: "/docs/category/c-introduction",
              },
              {
                to: "/docs/category/ares-research-cluster",
                label: "Ares User Guide",
              },
            ],
          },
          {
            title: "Links",
            items: [
              {
                label: "GRC GitHub",
                href: "https://github.com/grc-iit",
              },
              {
                label: "GRC LinkedIn",
                href: "https://www.linkedin.com/company/gnosis-research-center/",
              },
              {
                label: "GRC X",
                href: "https://twitter.com/grc_iit",
              },
              {
                label: "GRC YouTube",
                href: "https://www.youtube.com/channel/UCNtEyAt4_ckpIbX-gSv8sww",
              },
              {
                label: "Illinois Tech",
                href: "https://www.iit.edu/",
              },
              {
                label: "SCS Lab",
                href: "http://cs.iit.edu/~scs/",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} ${GNOSIS_TITLE} (${GNOSIS_SHORT}).`,
      },
      prism: {
        theme: lightTheme,
        darkTheme: darkTheme,
      },
    }),
};

module.exports = config;
