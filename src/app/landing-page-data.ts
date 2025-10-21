
export const testimonials = [
  {
    quote: "MetaMagic has been a game-changer for our stock photography business. We've cut our metadata workflow time by over 80% and our image visibility has skyrocketed. An essential tool.",
    name: "Sarah L.",
    title: "Professional Photographer"
  },
  {
    quote: "I used to dread writing alt text for my client's WordPress sites. Now, I can fix an entire media library in minutes. My clients are happy, and my SEO reports look great.",
    name: "Mike R.",
    title: "Freelance Web Developer"
  },
  {
    quote: "The meta description generator is scary good. It consistently writes better, more clickable descriptions than I can. Our blog's click-through rate from Google has increased by 15%.",
    name: "Elena K.",
    title: "Content Marketing Manager"
  },
  {
    quote: "As a blogger, image SEO was my bottleneck. MetaMagic automated the whole process. I'm getting more traffic from Google Images than ever before. Highly recommended!",
    name: "David Chen",
    title: "Travel Blogger"
  },
  {
    quote: "The ability to customize AI output with my own keywords is a killer feature. It gives me the perfect blend of automation and control. This is the SEO tool I didn't know I needed.",
    name: "Jessica P.",
    title: "E-commerce Store Owner"
  },
  {
    quote: "I manage multiple WordPress sites. The WP Alt Text tool is a lifesaver. Connecting a site and fixing all missing alt text in one go saves me an incredible amount of time.",
    name: "Tom Henderson",
    title: "Agency Owner"
  },
  {
    quote: "The pricing model is the best part. It's free to use the platform, and I just pay for my own Gemini API usage. It's transparent, fair, and incredibly cost-effective.",
    name: "Maria G.",
    title: "Indie Developer"
  },
  {
    quote: "I was skeptical about AI-generated metadata, but the quality is outstanding. The titles and descriptions are creative, relevant, and optimized for clicks. My sales on Adobe Stock have increased.",
    name: "Alex Johnson",
    title: "Stock Artist"
  },
  {
    quote: "The interface is so intuitive. I was able to connect my site and start generating metadata in less than five minutes. No complicated setup, just results.",
    name: "Emily W.",
    title: "Small Business Owner"
  },
  {
    quote: "This tool paid for itself within the first week. The time I saved on content updates allowed me to focus on creating new products. It's an incredible ROI.",
    name: "Brian S.",
    title: "Digital Creator"
  }
];

export const faqData = [
    {
      question: "How does the pricing work? Is it really free?",
      answer: "Yes, MetaMagic is completely free to use. We don't charge any subscription fees. The only cost is from your own Google Gemini API key usage. You have full control over your API key and can set quotas and monitor usage directly in your Google AI Studio account."
    },
    {
      question: "Is it secure to add my Gemini API key and WordPress password?",
      answer: "Absolutely. Your credentials are encrypted and stored securely in a Firestore database that only you can access. We use Firebase's robust security rules to ensure that your data is private and linked exclusively to your authenticated account."
    },
    {
      question: "What AI model does MetaMagic use?",
      answer: "MetaMagic is powered by Google's state-of-the-art Gemini family of models. We use different models for different tasks—like Gemini 2.5 Flash for its speed in text generation and Gemini Pro Vision for its powerful image analysis capabilities—to ensure the highest quality results."
    },
    {
      question: "Do I need to be an SEO expert to use this?",
      answer: "Not at all! MetaMagic is designed for everyone—from professional SEOs to bloggers, photographers, and small business owners. Our tools automate the best practices, so you can achieve expert-level results without the steep learning curve."
    },
    {
      question: "What is an 'Application Password' for WordPress?",
      answer: "An Application Password is a special password you can create in your WordPress user profile. It allows applications like MetaMagic to connect to your site securely without you having to use your main password. It's a standard and safe way to authorize external tools."
    },
    {
      question: "Can I edit the metadata the AI generates?",
      answer: "Yes! We encourage it. The AI gives you a fantastic, optimized starting point, but you can always tweak the titles, descriptions, and keywords directly in our interface before you export or update them."
    },
    {
      question: "What happens to my data?",
      answer: "Your API keys and WordPress connections are stored in your own private data space in our database. The images and content you process are sent to the Gemini API for generation but are not stored by MetaMagic."
    },
    {
      question: "Which SEO plugins for WordPress are supported?",
      answer: "Our Meta Description tool for WordPress is currently optimized to work with the 'All in One SEO' (AIOSEO) plugin, as it's one of the most popular. Support for other plugins like Yoast or Rank Math may be added in the future."
    },
    {
      question: "Is there a limit to how many images or pages I can process?",
      answer: "There are no limits imposed by MetaMagic. You can process as many items as you like. The only constraint will be the rate limits and quotas on your own Gemini API key, which are generally very generous for most use cases."
    },
    {
      question: "How do I get a Google Gemini API key?",
      answer: "You can get a free API key from Google AI Studio. Simply sign in with your Google account and create a new key. We have a link to it in the Account section of the app to make it easy for you."
    }
  ];

    