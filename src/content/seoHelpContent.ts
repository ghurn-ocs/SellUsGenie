/**
 * SEO Help Content - Centralized content for the SEO Success page
 */

export interface VideoLink {
  title: string;
  url: string;
  description: string;
}

export interface SectionContent {
  id: string;
  title: string;
  content: string;
  checklist?: string[];
  watchNext?: VideoLink;
  ctaChips?: Array<{
    label: string;
    href: string;
    icon: string;
  }>;
}

export interface TemplateContent {
  title: string;
  content: string;
  type: 'title' | 'meta' | 'intro' | 'faq';
}

export const watchFirstVideos: VideoLink[] = [
  {
    title: "Get 10x More Website Traffic with This Free SEO Technique",
    url: "https://www.youtube.com/watch?v=Zn3i5ac9ydw",
    description: "Learn the fundamental SEO technique that can dramatically increase your website traffic"
  },
  {
    title: "Why Your SEO Strategy Isn't Working Anymore",
    url: "https://www.youtube.com/watch?v=1_RG0Zvc0x0",
    description: "Discover what's changed in SEO and how to adapt your strategy"
  },
  {
    title: "How to Recover LOST SEO Traffic in 2025",
    url: "https://www.youtube.com/watch?v=peDRfb6eofg",
    description: "Step-by-step guide to diagnose and fix traffic drops"
  },
  {
    title: "Surfer Academy tutorial feat. Matt Kenyon",
    url: "https://www.youtube.com/watch?v=Gk9xmi6nvWA",
    description: "Advanced SEO optimization techniques and tools"
  },
  {
    title: "Matt Kenyon SEO Channel",
    url: "https://www.youtube.com/@mattkenyonSEO",
    description: "Access to micro-tools and comprehensive SEO resources"
  }
];

export const sections: SectionContent[] = [
  {
    id: "start-here",
    title: "Start Here: 15-Minute SEO Setup",
    content: "Get the basics right and you'll see more impressions, clicks, and sales within 2-4 weeks. This quick setup creates the foundation every successful store needs to rank higher in search results.",
    checklist: [
      "Set your Store Title & Meta Description (Dashboard → Settings → SEO)",
      "Choose 3–5 buyer-intent keywords for your top products",
      "Add alt text to your top 10 product images",
      "Create one Category Guide page using our template below"
    ],
    watchNext: {
      title: "Get 10x More Website Traffic with This Free SEO Technique",
      url: "https://www.youtube.com/watch?v=Zn3i5ac9ydw",
      description: "Essential viewing for understanding the core SEO strategy"
    },
    ctaChips: [
      {
        label: "Open SEO Settings",
        href: "/dashboard/settings/seo",
        icon: "Settings"
      },
      {
        label: "Manage Products",
        href: "/dashboard/catalog/products",
        icon: "Package"
      }
    ]
  },
  {
    id: "content-refresh",
    title: "Quick Wins: The 10x Content Refresh",
    content: "Transform underperforming pages into traffic magnets by aligning your title with your H1, writing concise first 60 words, and adding an FAQ section. This simple refresh can double your click-through rates.",
    checklist: [
      "Make your page title match your H1 heading exactly",
      "Rewrite your first 60 words to include your main keyword naturally",
      "Add 3-5 frequently asked questions at the bottom of each page",
      "Include your keyword in the first FAQ question",
      "Link to related products or categories in your answers"
    ],
    watchNext: {
      title: "Get 10x More Website Traffic with This Free SEO Technique",
      url: "https://www.youtube.com/watch?v=Zn3i5ac9ydw",
      description: "See the content refresh strategy in action"
    }
  },
  {
    id: "buyer-keywords",
    title: "Find Buyer-Intent Keywords (Fast)",
    content: "Focus on transactional keywords—words people use when they're ready to buy. These drive revenue, not just traffic. Informational keywords bring browsers; buyer-intent keywords bring customers.",
    checklist: [
      "Product Pages: Include keyword in title, first 100 words, image alt text, URL slug, and meta description",
      "Category Pages: Use keyword in H1, intro paragraph, 3-5 FAQs, and meta title/description",
      "Avoid stuffing—use keywords naturally in helpful content",
      "Test variations: 'buy custom dog collars' vs 'custom dog collars for sale'",
      "Check what competitors rank for and adapt (don't copy)"
    ],
    watchNext: {
      title: "Surfer Academy tutorial feat. Matt Kenyon",
      url: "https://www.youtube.com/watch?v=Gk9xmi6nvWA",
      description: "Deep dive into keyword research and optimization"
    },
    ctaChips: [
      {
        label: "Edit Products",
        href: "/dashboard/catalog/products",
        icon: "Package"
      },
      {
        label: "Manage Categories",
        href: "/dashboard/catalog/categories",
        icon: "Tags"
      }
    ]
  },
  {
    id: "competitor-seo",
    title: "Competitor SEO: Borrow What Already Works (Ethically)",
    content: "Smart store owners study what's working for competitors and adapt those strategies. This isn't copying—it's competitive intelligence that saves you months of guesswork.",
    checklist: [
      "Identify your top 5 competitors who rank for your target keywords",
      "Scan their product/category page titles and H1 headings for patterns",
      "Collect their FAQ questions—customers ask similar questions everywhere",
      "Compare their page loading speed to yours using Google PageSpeed Insights",
      "Review their internal linking: how do they connect products to categories?",
      "Spot content gaps: what questions aren't they answering?",
      "Define your unique differentiator: what makes your store better?"
    ],
    watchNext: {
      title: "How to Spy on Your Competitors' SEO & Steal Their Traffic",
      url: "https://www.youtube.com/@mattkenyonSEO",
      description: "Advanced competitive analysis techniques"
    }
  },
  {
    id: "site-health",
    title: "Site Health Basics (No Dev Needed)",
    content: "Technical SEO sounds scary, but most fixes are simple settings changes. Focus on speed, mobile experience, and internal links—these directly impact your search rankings.",
    checklist: [
      "Compress product images before uploading (aim for under 200KB each)",
      "Avoid auto-playing hero videos on mobile",
      "Enable lazy-loading on product grids (check your theme settings)",
      "Create internal links: Product → Category → Guide → Top Product",
      "Fill out all product fields—platform auto-generates schema markup",
      "Use descriptive URLs: /custom-dog-collars not /product-123"
    ],
    ctaChips: [
      {
        label: "Media Library",
        href: "/dashboard/media",
        icon: "Image"
      }
    ]
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting: Recover Lost Traffic",
    content: "Traffic drops happen. The key is diagnosing the cause quickly and applying the right fix. Most issues fall into these common patterns with straightforward solutions.",
    checklist: [
      "Traffic dropped after page edits → Check if title/H1 alignment changed → Realign to original keyword",
      "New pages not ranking → Verify they're published and crawlable → Add internal links from existing pages",
      "Click-through rate declined → Title may be too generic → Add year, benefit, or urgency",
      "Conversion rate dropped → Check if product info changed → Restore key selling points",
      "Seasonal traffic loss → Normal for some niches → Focus on off-season keywords"
    ],
    watchNext: {
      title: "How to Recover LOST SEO Traffic in 2025",
      url: "https://www.youtube.com/watch?v=peDRfb6eofg",
      description: "Complete traffic recovery methodology"
    }
  },
  {
    id: "micro-tools",
    title: "Lightweight 'Micro-Tools' to Speed You Up",
    content: "Small tools save big time. These simple widgets help you optimize titles, descriptions, and content without leaving your dashboard. No external subscriptions needed.",
    checklist: [
      "Use the Title Length Tool below to optimize for 50-60 characters",
      "Check meta descriptions with our counter tool (140-160 characters ideal)",
      "Test keyword placement with our simple scoring hints",
      "Copy our templates and customize for your products",
      "Bookmark Matt's channel for more micro-tools and quick fixes"
    ],
    watchNext: {
      title: "Matt Kenyon SEO Channel",
      url: "https://www.youtube.com/@mattkenyonSEO",
      description: "Access to comprehensive micro-tools library"
    }
  },
  {
    id: "tracking",
    title: "Track What Matters (Weekly, 10 Minutes)",
    content: "Focus on metrics that directly connect to revenue. Vanity metrics like page views feel good but don't pay the bills. Track these four KPIs weekly for real business insight.",
    checklist: [
      "Organic Sessions: How many people find you through search?",
      "Revenue from Organic: What's your search traffic worth in dollars?",
      "Top 5 Landing Pages: Which pages bring the most valuable visitors?",
      "Top 5 Converting Queries: What search terms lead to sales?",
      "Set up weekly email reports in Google Analytics 4",
      "Use UTM codes to track which SEO efforts drive the most revenue"
    ]
  }
];

export const productTemplate: TemplateContent[] = [
  {
    title: "Product Title Template",
    content: "[Product Name] - [Key Benefit] | [Brand Name]",
    type: "title"
  },
  {
    title: "Product Meta Description",
    content: "Shop [Product Name] at [Brand]. [Key benefit/feature]. [Social proof/guarantee]. Free shipping on orders over $X. Order today!",
    type: "meta"
  },
  {
    title: "Product Intro Paragraph",
    content: "Our [Product Name] is perfect for [target customer] who wants [primary benefit]. Made with [key feature], this [product type] delivers [specific result]. Available in [variants] with [guarantee/shipping info].",
    type: "intro"
  },
  {
    title: "Product FAQ Template",
    content: `Q: What makes this [product] different from others?
A: [Unique selling proposition + key differentiator]

Q: How long does shipping take?
A: [Shipping timeframe + any expedited options]

Q: What's your return policy?
A: [Return terms + customer satisfaction guarantee]

Q: Is this [product] suitable for [common use case]?
A: [Yes/no + explanation + alternative if needed]

Q: Do you offer bulk/wholesale pricing?
A: [Bulk pricing info + contact details for larger orders]`,
    type: "faq"
  }
];

export const categoryTemplate: TemplateContent[] = [
  {
    title: "Category Title Template",
    content: "[Category Name] - Best [Product Type] for [Target Audience] | [Brand]",
    type: "title"
  },
  {
    title: "Category Meta Description",
    content: "Discover our collection of [category]. Premium [product type] for [target audience]. [Unique value proposition]. Shop now with [shipping/guarantee].",
    type: "meta"
  },
  {
    title: "Category Intro Paragraph",
    content: "Welcome to our [Category Name] collection. Whether you're looking for [use case 1] or [use case 2], we have the perfect [product type] for your needs. Each [product] is [key quality/benefit] and backed by our [guarantee].",
    type: "intro"
  },
  {
    title: "Category FAQ Template",
    content: `Q: What's the difference between [product type A] and [product type B]?
A: [Clear explanation of differences and use cases]

Q: How do I choose the right [product] for my needs?
A: [Buying guide with key considerations]

Q: Do you offer samples or trials?
A: [Sample/trial policy + how to request]

Q: What's included with each [product]?
A: [What comes in the box/package]

Q: Can I get help choosing the right [product]?
A: [Customer service contact info + consultation options]`,
    type: "faq"
  }
];

export const competitorTrackingTemplate = `Competitor,Title Format,FAQ Topics,Internal Links,Speed Score,Content Gap
[Competitor 1],[Their title pattern],[Common FAQ themes],[Link strategy],[PageSpeed score],[What they're missing]
[Competitor 2],[Their title pattern],[Common FAQ themes],[Link strategy],[PageSpeed score],[What they're missing]
[Competitor 3],[Their title pattern],[Common FAQ themes],[Link strategy],[PageSpeed score],[What they're missing]`;

export const faqItems = [
  {
    question: "How long until I see SEO results?",
    answer: "Most stores see initial improvements in 2-4 weeks for existing pages, and 8-12 weeks for new content to rank. Quick wins like title optimization can improve click-through rates within days."
  },
  {
    question: "Do I need backlinks to rank well?",
    answer: "While backlinks help, focus on on-page SEO first. Great product descriptions, proper titles, and customer reviews often matter more for e-commerce stores than backlinks."
  },
  {
    question: "Are product pages or blog posts better for SEO?",
    answer: "Product pages for e-commerce stores. They convert better and target buyer-intent keywords. Add FAQ sections to product pages instead of creating separate blog posts."
  },
  {
    question: "Should I optimize every single product page?",
    answer: "Start with your top 20% of products by revenue. These pages typically drive 80% of your organic traffic and are worth the time investment."
  },
  {
    question: "What if my products have seasonal demand?",
    answer: "Create year-round content by focusing on related keywords during off-seasons. For example, 'winter boots' in summer becomes 'boots for next winter' or 'boot care tips'."
  },
  {
    question: "How often should I update my SEO?",
    answer: "Review your top pages monthly, update product titles quarterly, and refresh category pages twice a year. Focus on pages that drive revenue, not every page."
  }
];

export const keywordExamples = [
  {
    niche: "Custom Dog Collars",
    pageType: "Product",
    keyword: "personalized leather dog collar",
    placement: "Title, H1, first paragraph, image alt text"
  },
  {
    niche: "Custom Dog Collars", 
    pageType: "Category",
    keyword: "custom dog collars",
    placement: "H1, intro, FAQ questions, meta description"
  },
  {
    niche: "Organic Skincare",
    pageType: "Product", 
    keyword: "organic anti-aging serum",
    placement: "Product name, benefits list, ingredient description"
  },
  {
    niche: "Organic Skincare",
    pageType: "Category",
    keyword: "natural skincare products",
    placement: "Category description, buying guide, comparison chart"
  }
];

export const troubleshootingMatrix = [
  {
    symptom: "Traffic dropped after page edits",
    cause: "Title/H1 changed or keyword removed",
    fix: "Restore original keyword alignment; update internal links"
  },
  {
    symptom: "New pages not appearing in search",
    cause: "Not indexed or no internal links",
    fix: "Add internal links from existing pages; check Google Search Console"
  },
  {
    symptom: "Low click-through rate", 
    cause: "Title too generic or missing benefit",
    fix: "Add year, benefit, or urgency to title; test variations"
  },
  {
    symptom: "High bounce rate on product pages",
    cause: "Mismatched search intent or slow loading",
    fix: "Align content with search terms; optimize images"
  },
  {
    symptom: "Ranking but not converting",
    cause: "Wrong keywords or missing trust signals", 
    fix: "Target buyer-intent keywords; add reviews and guarantees"
  }
];

export const trackingKPIs = [
  {
    metric: "Organic Sessions",
    description: "Monthly visitors from search engines",
    goal: "15-25% month-over-month growth",
    source: "Google Analytics 4 → Reports → Acquisition → Traffic acquisition"
  },
  {
    metric: "Revenue from Organic",
    description: "Sales attributed to search traffic",
    goal: "Should increase faster than traffic",
    source: "GA4 → Reports → Monetization → Ecommerce purchases"
  },
  {
    metric: "Top Landing Pages",
    description: "Pages that bring most organic traffic",
    goal: "Product/category pages dominating",
    source: "GA4 → Reports → Engagement → Pages and screens"
  },
  {
    metric: "Converting Search Queries",
    description: "Search terms that lead to sales",
    goal: "Buyer-intent keywords performing best",
    source: "Google Search Console → Performance → filter by clicks"
  }
];