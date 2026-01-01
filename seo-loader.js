// seo-loader.js - Enhanced SEO content loader for Document Perspective Correction Tool
(function() {
  'use strict';
  
  const seoContent = {
    faq: [
      {
        question: "What image formats are supported?",
        answer: "The tool supports JPG, JPEG, PNG, WebP, and most common image formats. You can upload photos taken from smartphones, digital cameras, or scanned documents."
      },
      {
        question: "Can I correct multiple documents at once?",
        answer: "Currently, the tool processes one document at a time to ensure optimal quality and precision. Simply save your corrected image and upload the next one."
      },
      {
        question: "Does it work on mobile devices?",
        answer: "Yes! The tool is fully responsive and works on smartphones and tablets. You can take a photo of a document and correct it immediately on your mobile device."
      },
      {
        question: "What's the maximum image size supported?",
        answer: "The tool can handle high-resolution images. Processing happens in your browser, so performance depends on your device capabilities. Most modern devices handle images up to 20MP without issues."
      },
      {
        question: "Can I undo corrections or adjust points?",
        answer: "Yes, you can reposition the corner points before applying the correction. If you're not satisfied with the result, simply reload the original image and try again."
      },
      {
        question: "Do I need to create an account?",
        answer: "No account or registration required. The tool is completely free and works immediately without any sign-up process."
      },
      {
        question: "Will it work with handwritten documents?",
        answer: "Absolutely! The tool corrects perspective distortion regardless of document type - printed text, handwritten notes, drawings, diagrams, or mixed content all work perfectly."
      },
      {
        question: "Can I use corrected images for OCR?",
        answer: "Yes! Perspective-corrected documents work much better with OCR (Optical Character Recognition) software because the text is properly aligned and easier to recognize."
      },
      {
        question: "Does it work offline?",
        answer: "After the initial page load, basic functionality works offline since all processing happens in your browser. However, you need an internet connection to access the tool initially."
      },
      {
        question: "How accurate is the perspective correction?",
        answer: "The tool uses advanced matrix transformation algorithms that provide professional-grade accuracy. The 4-point selection method ensures precise corner detection and distortion correction."
      }
    ],
    features: [
      "4-point perspective transformation with matrix calculations",
      "100% client-side processing - complete privacy and security",
      "Supports JPG, PNG, WebP, and other common formats",
      "Real-time preview of perspective correction",
      "Maintains original image resolution and quality",
      "Works on desktop, tablet, and mobile devices",
      "No installation, registration, or account required",
      "Free unlimited use with no hidden costs",
      "Drag-and-drop or click-to-upload interface",
      "Instant download of corrected images",
      "Adjustable corner point positioning",
      "Handles documents of any size and orientation"
    ],
    useCases: [
      "Straighten photographed receipts for expense tracking and reimbursement",
      "Correct business card photos for digital contact management",
      "Fix skewed contract or legal document scans for archival",
      "Transform angled whiteboard photos into readable images",
      "Prepare book or magazine pages for digital archiving",
      "Correct perspective in architectural or technical drawings",
      "Straighten ID cards, licenses, or certificates for applications",
      "Fix distorted photos of artwork or posters",
      "Prepare documents for OCR text extraction",
      "Create professional document scans from smartphone photos",
      "Correct perspective in real estate or property documents",
      "Straighten handwritten notes captured from various angles"
    ],
    howTo: {
      steps: [
        {
          title: "Upload Your Document Image",
          description: "Click the upload button or drag and drop your document photo into the tool. Supported formats include JPG, PNG, and WebP."
        },
        {
          title: "Select Four Corner Points",
          description: "Click on the four corners of your document in the image. The tool will highlight these points so you can see your selection clearly."
        },
        {
          title: "Adjust Points if Needed",
          description: "Drag any corner point to fine-tune the selection. Make sure all four corners accurately represent the document boundaries."
        },
        {
          title: "Apply Perspective Correction",
          description: "Click the correction button to transform the image. The tool will process the perspective transformation in real-time."
        },
        {
          title: "Download Corrected Image",
          description: "Review the corrected document and download it to your device. The output maintains your original image quality."
        }
      ]
    },
    tips: [
      "Ensure good lighting when photographing documents for best results",
      "Try to capture the entire document with some border space around edges",
      "Hold your camera as parallel to the document as possible",
      "Higher resolution photos produce better corrected results",
      "Select corner points as accurately as possible for optimal correction",
      "For curved documents, flatten them before photographing if possible",
      "Use the zoom function on your camera for distant or small documents",
      "Multiple angles? Take several photos and choose the clearest one"
    ],
    technical: {
      title: "Technical Details",
      details: [
        "Uses homography matrix transformation for perspective correction",
        "Implements bilinear interpolation for smooth image resampling",
        "Canvas API based rendering for high-performance processing",
        "Preserves EXIF metadata when possible",
        "Optimized algorithms for minimal processing time",
        "Supports color and grayscale documents equally well"
      ]
    },
    keywords: [
      "perspective correction",
      "document scanner",
      "skew correction",
      "image deskewing",
      "image rectification",
      "4-point transformation",
      "6-point transformation",
      "8-point transformation",
      "perspective warp",
      "document photo crop and straighten",
      "perserve quality",
      "client-side processing",
      "privacy-focused",
      "browser-based tool",
      "photo straightening",
      "document digitization",
      "receipt scanner",
      "business card scanner",
      "OCR preparation",
      "perspective distortion fix",
      "crop and straighten",
      "photo to cropped image",
      "document photo crop",
      "photo perspective adjust",
      "document perspective adjust",
      "document photo fix",
      "online document scanner"
    ],
    developers: [
      {
        title: "Open to Developers",
        details: [
          "Currently only one developer is working on this project.",
          "Contribute on GitHub: https://github.com/ni-kit-mht/perspective-correction"
        ]
      }
    ]
  };

  // Inject CSS styles
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .seo-content-wrapper {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 60px 20px;
        margin-top: 80px;
        position: relative;
        overflow: hidden;
      }
      
      .seo-content-wrapper::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
      }
      
      .seo-section-header {
        text-align: center;
        margin-bottom: 50px;
      }
      
      .seo-section-header h2 {
        color: white;
        font-size: 2.5em;
        margin: 0 0 10px 0;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      }
      
      .seo-section-header p {
        color: rgba(255,255,255,0.9);
        font-size: 1.1em;
        margin: 0;
      }
      
      .seo-content-container {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .seo-content-container section {
        background: white;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .seo-content-container section:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0,0,0,0.3);
      }
      
      .seo-content-container h2 {
        color: #667eea;
        font-size: 1.5em;
        margin: 0 0 20px 0;
        padding-bottom: 10px;
        border-bottom: 2px solid #f093fb;
      }
      
      .seo-content-container details {
        margin-bottom: 15px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
      }
      
      .seo-content-container summary {
        padding: 15px;
        cursor: pointer;
        background: #f8f9fa;
        font-weight: 600;
        color: #333;
        transition: background 0.2s ease;
        user-select: none;
      }
      
      .seo-content-container summary:hover {
        background: #e9ecef;
      }
      
      .seo-content-container details[open] summary {
        background: #667eea;
        color: white;
      }
      
      .seo-content-container details p,
      .seo-content-container details ul,
      .seo-content-container details ol {
        padding: 15px;
        margin: 0;
        line-height: 1.6;
        color: #555;
      }
      
      .seo-content-container ul,
      .seo-content-container ol {
        padding-left: 35px;
      }
      
      .seo-content-container li {
        margin-bottom: 10px;
      }
      
      .seo-content-container li strong {
        color: #667eea;
      }
      
      .seo-keywords {
        grid-column: 1 / -1;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
      }
      
      .seo-keywords h2 {
        color: white;
        border-bottom-color: rgba(255,255,255,0.3);
      }
      
      .seo-keywords-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding: 0;
        list-style: none;
      }
      
      .seo-keywords-list li {
        background: white;
        color: #f5576c;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.9em;
        font-weight: 600;
        margin: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .seo-popup {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        max-width: 320px;
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
      }
      
      .seo-popup.hidden {
        display: none;
      }
      
      .seo-popup-close {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
        line-height: 1;
        padding: 5px;
      }
      
      .seo-popup-close:hover {
        color: #333;
      }
      
      .seo-popup h3 {
        color: #667eea;
        margin: 0 0 10px 0;
        font-size: 1.2em;
      }
      
      .seo-popup p {
        color: #555;
        margin: 0;
        line-height: 1.5;
        font-size: 0.95em;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @media (max-width: 768px) {
        .seo-section-header h2 {
          font-size: 2em;
        }
        
        .seo-content-container {
          grid-template-columns: 1fr;
        }
        
        .seo-popup {
          left: 20px;
          right: 20px;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createDevelopersSection() {
    const section = document.createElement('section');
    section.className = 'seo-developers-section';
    section.setAttribute('aria-label', 'Developer Information');
    
    const heading = document.createElement('h2');
    heading.textContent = '👨‍💻 Developers';
    section.appendChild(heading);

    seoContent.developers.forEach(dev => {
      const details = document.createElement('details');
      details.open = true;
      const summary = document.createElement('summary');
      summary.textContent = dev.title;
      details.appendChild(summary);

      const ul = document.createElement('ul');
      dev.details.forEach(detail => {
        const li = document.createElement('li');
        li.textContent = detail;
        ul.appendChild(li);
      });
      
      details.appendChild(ul);
      section.appendChild(details);
    });

    return section;
  }

  function createFAQSection() {
    const section = document.createElement('section');
    section.className = 'seo-faq-section';
    section.setAttribute('aria-label', 'Additional Frequently Asked Questions');
    
    const heading = document.createElement('h2');
    heading.textContent = '❓ More FAQs';
    section.appendChild(heading);

    seoContent.faq.forEach(item => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = item.question;
      details.appendChild(summary);
      const answer = document.createElement('p');
      answer.textContent = item.answer;
      details.appendChild(answer);
      section.appendChild(details);
    });

    return section;
  }

  function createFeaturesSection() {
    const section = document.createElement('section');
    section.className = 'seo-features-section';
    section.setAttribute('aria-label', 'Complete Feature List');
    
    const details = document.createElement('details');
    details.open = true;
    const summary = document.createElement('summary');
    summary.textContent = 'View All Features';
    details.appendChild(summary);

    const heading = document.createElement('h2');
    heading.textContent = '✨ Features';
    section.appendChild(heading);

    const ul = document.createElement('ul');
    seoContent.features.forEach(feature => {
      const li = document.createElement('li');
      li.textContent = feature;
      ul.appendChild(li);
    });
    
    details.appendChild(ul);
    section.appendChild(details);

    return section;
  }

  function createUseCasesSection() {
    const section = document.createElement('section');
    section.className = 'seo-usecases-section';
    section.setAttribute('aria-label', 'Use Cases and Applications');
    
    const heading = document.createElement('h2');
    heading.textContent = '💼 Use Cases';
    section.appendChild(heading);

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'See All Use Cases';
    details.appendChild(summary);

    const ul = document.createElement('ul');
    seoContent.useCases.forEach(useCase => {
      const li = document.createElement('li');
      li.textContent = useCase;
      ul.appendChild(li);
    });
    
    details.appendChild(ul);
    section.appendChild(details);

    return section;
  }

  function createHowToSection() {
    const section = document.createElement('section');
    section.className = 'seo-howto-section';
    section.setAttribute('aria-label', 'How to Use');
    
    const heading = document.createElement('h2');
    heading.textContent = '📖 How to Use';
    section.appendChild(heading);

    const details = document.createElement('details');
    details.open = true;
    const summary = document.createElement('summary');
    summary.textContent = 'Step-by-Step Guide';
    details.appendChild(summary);

    const ol = document.createElement('ol');
    seoContent.howTo.steps.forEach(step => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = step.title;
      li.appendChild(strong);
      li.appendChild(document.createTextNode(': ' + step.description));
      ol.appendChild(li);
    });
    
    details.appendChild(ol);
    section.appendChild(details);

    return section;
  }

  function createTipsSection() {
    const section = document.createElement('section');
    section.className = 'seo-tips-section';
    section.setAttribute('aria-label', 'Tips for Best Results');
    
    const heading = document.createElement('h2');
    heading.textContent = '💡 Pro Tips';
    section.appendChild(heading);

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Get Better Results';
    details.appendChild(summary);

    const ul = document.createElement('ul');
    seoContent.tips.forEach(tip => {
      const li = document.createElement('li');
      li.textContent = tip;
      ul.appendChild(li);
    });
    
    details.appendChild(ul);
    section.appendChild(details);

    return section;
  }

  function createTechnicalSection() {
    const section = document.createElement('section');
    section.className = 'seo-technical-section';
    section.setAttribute('aria-label', 'Technical Information');
    
    const heading = document.createElement('h2');
    heading.textContent = '⚙️ Technical';
    section.appendChild(heading);

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Technical Details';
    details.appendChild(summary);

    const ul = document.createElement('ul');
    seoContent.technical.details.forEach(detail => {
      const li = document.createElement('li');
      li.textContent = detail;
      ul.appendChild(li);
    });
    
    details.appendChild(ul);
    section.appendChild(details);

    return section;
  }

  function createKeywordsSection() {
    const section = document.createElement('section');
    section.className = 'seo-keywords';
    section.setAttribute('aria-label', 'Related Keywords');
    
    const heading = document.createElement('h2');
    heading.textContent = '🔍 Related Keywords';
    section.appendChild(heading);

    const ul = document.createElement('ul');
    ul.className = 'seo-keywords-list';
    seoContent.keywords.forEach(keyword => {
      const li = document.createElement('li');
      li.textContent = keyword;
      ul.appendChild(li);
    });
    
    section.appendChild(ul);

    return section;
  }

  function createPopup() {
    const popup = document.createElement('div');
    popup.className = 'seo-popup';
    popup.innerHTML = `
      <button class="seo-popup-close" aria-label="Close">&times;</button>
      <h3>💡 Did You Know?</h3>
      <p>This tool processes everything locally in your browser. Your documents never leave your device, ensuring complete privacy!</p>
    `;

    const closeBtn = popup.querySelector('.seo-popup-close');
    closeBtn.addEventListener('click', () => {
      popup.classList.add('hidden');
      localStorage.setItem('seo-popup-closed', 'true');
    });

    // Show popup after 3 seconds if not previously closed
    if (!localStorage.getItem('seo-popup-closed')) {
      setTimeout(() => {
        document.body.appendChild(popup);
      }, 3000);
    }
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', insertContent);
    } else {
      insertContent();
    }
  }

  function insertContent() {
    injectStyles();
    
    const script = document.currentScript || document.querySelector('script[src*="seo-loader.js"]');
    
    if (!script) {
      console.warn('SEO loader: Could not find script element');
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'seo-content-wrapper';

    const header = document.createElement('div');
    header.className = 'seo-section-header';
    header.innerHTML = `
      <h2>📚 SEO Resources & Information</h2>
      <p>Everything you need to know about perspective correction</p>
    `;
    wrapper.appendChild(header);

    const container = document.createElement('div');
    container.className = 'seo-content-container';
    
    container.appendChild(createHowToSection());
    container.appendChild(createFeaturesSection());
    container.appendChild(createUseCasesSection());
    container.appendChild(createTipsSection());
    container.appendChild(createFAQSection());
    container.appendChild(createTechnicalSection());
    container.appendChild(createDevelopersSection());
    container.appendChild(createKeywordsSection());

    wrapper.appendChild(container);
    script.parentNode.insertBefore(wrapper, script.nextSibling);

    createPopup();
  }

  init();
})();