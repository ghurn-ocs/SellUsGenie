import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ExternalLink, 
  Play, 
  ChevronDown, 
  ChevronRight,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Info,
  Menu,
  X
} from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Tabs from '@radix-ui/react-tabs';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Toast from '@radix-ui/react-toast';

import { CtaChip } from '../components/CtaChip';
import { CopyBlock } from '../components/CopyBlock';
import { LengthCounter } from '../components/LengthCounter';

import {
  sections,
  watchFirstVideos,
  productTemplate,
  categoryTemplate,
  competitorTrackingTemplate,
  faqItems,
  keywordExamples,
  troubleshootingMatrix,
  trackingKPIs
} from '../content/seoHelpContent';

import '../styles/seo-help.css';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

// Custom hook for scroll spy
const useScrollSpy = (sections: TocItem[]) => {
  const [activeId, setActiveId] = useState<string>('');
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0.1
      }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  return activeId;
};

// Title Length Tool Component
const TitleLengthTool: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
        <Search className="w-5 h-5" />
        Title Length Tool
      </h4>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="keyword-check" className="block text-sm font-medium text-gray-700 mb-2">
            Target Keyword (optional)
          </label>
          <input
            id="keyword-check"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g., custom dog collars"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <LengthCounter
          label="Page Title"
          placeholder="Enter your page title here..."
          minLength={30}
          maxLength={60}
          idealMin={50}
          idealMax={60}
          keywordToCheck={keyword || undefined}
        />
      </div>
    </div>
  );
};

// Meta Description Tool Component
const MetaDescriptionTool: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
      <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5" />
        Meta Description Tool
      </h4>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="meta-keyword" className="block text-sm font-medium text-gray-700 mb-2">
            Target Keyword (optional)
          </label>
          <input
            id="meta-keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g., organic skincare products"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <LengthCounter
          label="Meta Description"
          placeholder="Write a compelling meta description that includes your keyword and encourages clicks..."
          minLength={120}
          maxLength={160}
          idealMin={140}
          idealMax={160}
          keywordToCheck={keyword || undefined}
          multiline
        />
      </div>
    </div>
  );
};

export const SeoHelpPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Table of Contents structure
  const tocItems: TocItem[] = [
    { id: 'introduction', title: 'Introduction', level: 1 },
    { id: 'watch-first', title: 'Watch First', level: 2 },
    { id: 'start-here', title: 'Start Here: 15-Minute Setup', level: 1 },
    { id: 'content-refresh', title: 'Quick Wins: Content Refresh', level: 1 },
    { id: 'buyer-keywords', title: 'Find Buyer-Intent Keywords', level: 1 },
    { id: 'keyword-examples', title: 'Keyword Examples', level: 2 },
    { id: 'title-tool', title: 'Title Length Tool', level: 2 },
    { id: 'competitor-seo', title: 'Competitor SEO Analysis', level: 1 },
    { id: 'templates', title: 'Product & Category Templates', level: 1 },
    { id: 'meta-tool', title: 'Meta Description Tool', level: 2 },
    { id: 'site-health', title: 'Site Health Basics', level: 1 },
    { id: 'troubleshooting', title: 'Troubleshooting', level: 1 },
    { id: 'micro-tools', title: 'Micro-Tools', level: 1 },
    { id: 'tracking', title: 'Track What Matters', level: 1 },
    { id: 'faq', title: 'FAQ', level: 1 }
  ];

  const activeId = useScrollSpy(tocItems);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast.Provider swipeDirection="right">
        <Tooltip.Provider>
          <div className="container mx-auto px-4 py-8">
            {/* Mobile Menu Button */}
            <button
              className="xl:hidden flex items-center gap-2 mb-6 p-2 bg-white border border-gray-300 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-toc"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span>Table of Contents</span>
            </button>

            <div className="flex gap-8">
              {/* Desktop TOC */}
              <aside className="hidden xl:block w-64 flex-shrink-0">
                <nav className="seo-help-toc" aria-label="Table of contents">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contents</h3>
                  <ul className="space-y-1">
                    {tocItems.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => scrollToSection(item.id)}
                          className={`
                            seo-help-toc-link w-full text-left
                            ${activeId === item.id ? 'active' : ''}
                            ${item.level === 2 ? 'level-2' : ''}
                            ${item.level === 3 ? 'level-3' : ''}
                          `}
                        >
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>

              {/* Mobile TOC */}
              {mobileMenuOpen && (
                <div 
                  id="mobile-toc"
                  className="xl:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div 
                    className="absolute left-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Contents</h3>
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1 hover:bg-gray-100 rounded"
                        aria-label="Close menu"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <nav>
                      <ul className="space-y-1">
                        {tocItems.map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => scrollToSection(item.id)}
                              className={`
                                seo-help-toc-link w-full text-left
                                ${activeId === item.id ? 'active' : ''}
                                ${item.level === 2 ? 'level-2' : ''}
                                ${item.level === 3 ? 'level-3' : ''}
                              `}
                            >
                              {item.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                </div>
              )}

              {/* Main Content */}
              <main className="flex-1 max-w-4xl" ref={contentRef}>
                {/* Page Header */}
                <header className="mb-12">
                  <h1 id="introduction" className="seo-help-section text-4xl font-bold text-gray-900 mb-6">
                    SEO Success for Store Owners
                  </h1>
                  <p className="text-xl text-gray-700 leading-relaxed mb-6">
                    Transform your store into a traffic-generating machine. This guide delivers practical, 
                    non-technical SEO strategies that actually work for e-commerce businesses. 
                    Follow these steps and watch your organic traffic—and sales—grow.
                  </p>
                </header>

                {/* Watch First Section */}
                <section id="watch-first" className="seo-help-section mb-16">
                  <h2 className="flex items-center gap-3 mb-6">
                    <Play className="w-8 h-8 text-blue-600" />
                    Watch First: Essential Videos
                  </h2>
                  <p className="text-gray-700 mb-6">
                    Start with these key videos from Matt Kenyon for the foundation knowledge 
                    you need to succeed with SEO.
                  </p>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {watchFirstVideos.map((video, index) => (
                      <div key={index} className="video-card">
                        <h3 className="video-card-title">{video.title}</h3>
                        <p className="video-card-description">{video.description}</p>
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="video-card-link"
                        >
                          <Play className="w-4 h-4" />
                          Watch Video
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Dynamic Sections */}
                {sections.map((section, index) => (
                  <section key={section.id} id={section.id} className="seo-help-section mb-16">
                    <h2>{section.title}</h2>
                    <p>{section.content}</p>

                    {/* CTA Chips */}
                    {section.ctaChips && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {section.ctaChips.map((chip, chipIndex) => (
                          <CtaChip
                            key={chipIndex}
                            label={chip.label}
                            href={chip.href}
                            icon={chip.icon}
                          />
                        ))}
                      </div>
                    )}

                    {/* Checklist */}
                    {section.checklist && (
                      <div className="seo-checklist">
                        {section.checklist.map((item, itemIndex) => (
                          <div key={itemIndex} className="seo-checklist-item">
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Special Content per Section */}
                    {section.id === 'buyer-keywords' && (
                      <>
                        <div id="keyword-examples" className="mb-8">
                          <h3>Keyword Placement Examples</h3>
                          <div className="overflow-x-auto">
                            <table className="keyword-table">
                              <thead>
                                <tr>
                                  <th>Niche</th>
                                  <th>Page Type</th>
                                  <th>Target Keyword</th>
                                  <th>Where to Place</th>
                                </tr>
                              </thead>
                              <tbody>
                                {keywordExamples.map((example, i) => (
                                  <tr key={i}>
                                    <td>{example.niche}</td>
                                    <td>{example.pageType}</td>
                                    <td className="font-semibold">{example.keyword}</td>
                                    <td>{example.placement}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div id="title-tool">
                          <h3>Title Optimization Tool</h3>
                          <TitleLengthTool />
                        </div>
                      </>
                    )}

                    {section.id === 'competitor-seo' && (
                      <div className="mb-8">
                        <h3>Competitor Tracking Template</h3>
                        <p className="text-gray-700 mb-4">
                          Copy this CSV template into Google Sheets to track your competitive research:
                        </p>
                        <CopyBlock
                          title="Competitor Analysis Template"
                          content={competitorTrackingTemplate}
                        />
                      </div>
                    )}

                    {section.id === 'troubleshooting' && (
                      <div className="mb-8">
                        <h3>Common Issues & Quick Fixes</h3>
                        <div className="troubleshooting-grid">
                          {troubleshootingMatrix.map((issue, i) => (
                            <div key={i} className="troubleshooting-card">
                              <div className="troubleshooting-symptom">
                                Problem: {issue.symptom}
                              </div>
                              <div className="troubleshooting-cause">
                                Likely Cause: {issue.cause}
                              </div>
                              <div className="troubleshooting-fix">
                                Quick Fix: {issue.fix}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {section.id === 'tracking' && (
                      <div className="mb-8">
                        <h3>Essential KPIs to Monitor</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {trackingKPIs.map((kpi, i) => (
                            <div key={i} className="kpi-card">
                              <div className="kpi-metric">{kpi.metric}</div>
                              <div className="kpi-description">{kpi.description}</div>
                              <div className="kpi-goal">Target: {kpi.goal}</div>
                              <div className="kpi-source">Source: {kpi.source}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Watch Next */}
                    {section.watchNext && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          Watch Next
                        </h4>
                        <p className="text-blue-800 mb-2">{section.watchNext.description}</p>
                        <a
                          href={section.watchNext.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {section.watchNext.title}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </section>
                ))}

                {/* Templates Section */}
                <section id="templates" className="seo-help-section mb-16">
                  <h2>Product & Category Templates (Copy-Paste Ready)</h2>
                  <p className="mb-6">
                    Save hours of work with these proven templates. Copy, customize for your products, 
                    and paste into your store. The platform automatically generates schema markup 
                    when you fill out these fields properly.
                  </p>

                  <Tabs.Root defaultValue="product" className="mb-8">
                    <Tabs.List className="flex border-b border-gray-200 mb-6">
                      <Tabs.Trigger
                        value="product"
                        className="px-4 py-2 text-sm font-medium text-gray-600 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
                      >
                        Product Template
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="category"
                        className="px-4 py-2 text-sm font-medium text-gray-600 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
                      >
                        Category Template
                      </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="product" className="space-y-6">
                      <div className="grid gap-2">
                        <CtaChip
                          label="Edit Products"
                          href="/dashboard/catalog/products"
                          icon="Package"
                          className="w-fit"
                        />
                      </div>
                      {productTemplate.map((template, i) => (
                        <CopyBlock
                          key={i}
                          title={template.title}
                          content={template.content}
                        />
                      ))}
                    </Tabs.Content>

                    <Tabs.Content value="category" className="space-y-6">
                      <div className="grid gap-2">
                        <CtaChip
                          label="Manage Categories"
                          href="/dashboard/catalog/categories"
                          icon="Tags"
                          className="w-fit"
                        />
                      </div>
                      {categoryTemplate.map((template, i) => (
                        <CopyBlock
                          key={i}
                          title={template.title}
                          content={template.content}
                        />
                      ))}
                    </Tabs.Content>
                  </Tabs.Root>

                  <div id="meta-tool">
                    <h3>Meta Description Optimizer</h3>
                    <MetaDescriptionTool />
                  </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="seo-help-section mb-16">
                  <h2>Frequently Asked Questions</h2>
                  <p className="mb-6">
                    Common questions from store owners just starting their SEO journey.
                  </p>

                  <Accordion.Root type="single" collapsible className="space-y-4">
                    {faqItems.map((item, index) => (
                      <Accordion.Item
                        key={index}
                        value={`faq-${index}`}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <Accordion.Header>
                          <Accordion.Trigger className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset">
                            <span className="font-medium text-gray-900">{item.question}</span>
                            <ChevronDown className="w-5 h-5 text-gray-500 transition-transform duration-200 data-[state=open]:rotate-180" />
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="px-4 pb-4 text-gray-700 leading-relaxed data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                          {item.answer}
                        </Accordion.Content>
                      </Accordion.Item>
                    ))}
                  </Accordion.Root>
                </section>

                {/* Call to Action */}
                <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Ready to Boost Your Store's Traffic?</h2>
                  <p className="text-blue-100 mb-6">
                    Start with the 15-minute setup, then work through each section. 
                    Most store owners see their first traffic improvements within 2-4 weeks.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <CtaChip
                      label="Open SEO Settings"
                      href="/dashboard/settings/seo"
                      icon="Settings"
                      className="bg-white text-blue-600 hover:bg-gray-50"
                    />
                    <a
                      href="https://www.youtube.com/@mattkenyonSEO"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-full font-medium transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Watch More Videos
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </section>
              </main>
            </div>
          </div>
        </Tooltip.Provider>
        <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col p-6 gap-2 w-96 max-w-[100vw] m-0 list-none z-50 outline-none" />
      </Toast.Provider>
    </div>
  );
};

export default SeoHelpPage;