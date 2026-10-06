// Database Seeder for BrandCreator
// Seeds 5+ Creators, 5+ Brands, Admin, Campaigns, Applications, ContentSubmissions, Messages, and Payments
// featuring: Krish, Manav, Utsav, Dhruv, Smit, and Ravi.
// Command: node seed.js

require('dotenv').config();
const {
  sequelize,
  User,
  CreatorProfile,
  BrandProfile,
  Campaign,
  Application,
  ContentSubmission,
  Message,
  Payment
} = require('./models');

async function seed() {
  try {
    console.log('🔄 Connecting to MySQL & Syncing database tables...');

    // Disable foreign key checks to allow dropping and recreating tables cleanly
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ All MySQL tables created and synchronized.');

    // 1. Create Admin User
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'demo123',
      role: 'admin',
      isVerified: true
    });
    console.log('✅ Admin created: admin@demo.com / demo123');

    // 2. Creators Data (Krish, Manav, Utsav, Dhruv, Smit, Ravi)
    const creatorsData = [
      {
        name: 'Krish Vaghasiya',
        email: 'krish@creator.com',
        password: 'demo123',
        role: 'creator',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        profile: {
          bio: 'Tech & AI content creator. Reviewing the latest gadgets, developer tools, and cutting-edge software products.',
          niche: ['Tech', 'AI', 'Gadgets'],
          location: 'Surat, Gujarat, India',
          instagramUsername: 'krish.vaghasiya',
          instagramFollowers: 185000,
          instagramUrl: 'https://instagram.com/krish.vaghasiya',
          youtubeUsername: 'Krish Tech',
          youtubeSubscribers: 95000,
          youtubeUrl: 'https://youtube.com',
          totalFollowers: 280000,
          engagementRate: 5.4,
          aiScore: 92,
          fakeFollowerPercentage: 6.2,
          contentConsistency: 94,
          isFeatured: true,
          collaborationCount: 18,
          postRate: 20000,
          storyRate: 8000,
          videoRate: 35000,
          audienceLocations: [
            { country: 'India', percentage: 76 },
            { country: 'USA', percentage: 12 },
            { country: 'UK', percentage: 7 },
            { country: 'Other', percentage: 5 }
          ],
          tags: ['tech', 'ai', 'surat', 'gadgets', 'coding']
        }
      },
      {
        name: 'Manav Sharma',
        email: 'manav@creator.com',
        password: 'demo123',
        role: 'creator',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        profile: {
          bio: 'Streetwear fashion, grooming & lifestyle trends. Helping men dress sharper and live better.',
          niche: ['Fashion', 'Lifestyle', 'Grooming'],
          location: 'Mumbai, Maharashtra, India',
          instagramUsername: 'manav.fits',
          instagramFollowers: 140000,
          instagramUrl: 'https://instagram.com/manav.fits',
          youtubeUsername: 'Manav Lifestyle',
          youtubeSubscribers: 60000,
          youtubeUrl: 'https://youtube.com',
          totalFollowers: 200000,
          engagementRate: 4.8,
          aiScore: 86,
          fakeFollowerPercentage: 7.5,
          contentConsistency: 88,
          isFeatured: true,
          collaborationCount: 14,
          postRate: 18000,
          storyRate: 6000,
          videoRate: 28000,
          audienceLocations: [
            { country: 'India', percentage: 80 },
            { country: 'UAE', percentage: 10 },
            { country: 'UK', percentage: 6 },
            { country: 'Other', percentage: 4 }
          ],
          tags: ['fashion', 'streetwear', 'mumbai', 'grooming']
        }
      },
      {
        name: 'Utsav Joshi',
        email: 'utsav@creator.com',
        password: 'demo123',
        role: 'creator',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        profile: {
          bio: 'Travel photographer & culinary explorer. Uncovering secret heritage trails and authentic regional food.',
          niche: ['Travel', 'Food', 'Culture'],
          location: 'Ahmedabad, Gujarat, India',
          instagramUsername: 'utsav.journeys',
          instagramFollowers: 110000,
          instagramUrl: 'https://instagram.com/utsav.journeys',
          youtubeUsername: 'Utsav Travels',
          youtubeSubscribers: 45000,
          youtubeUrl: 'https://youtube.com',
          totalFollowers: 155000,
          engagementRate: 6.2,
          aiScore: 89,
          fakeFollowerPercentage: 5.1,
          contentConsistency: 91,
          isFeatured: true,
          collaborationCount: 11,
          postRate: 15000,
          storyRate: 5000,
          videoRate: 24000,
          audienceLocations: [
            { country: 'India', percentage: 85 },
            { country: 'USA', percentage: 8 },
            { country: 'Other', percentage: 7 }
          ],
          tags: ['travel', 'food', 'ahmedabad', 'photography']
        }
      },
      {
        name: 'Dhruv Verma',
        email: 'dhruv@creator.com',
        password: 'demo123',
        role: 'creator',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        profile: {
          bio: 'Certified strength & conditioning coach. Daily home workouts, bodybuilding tips, and science-backed nutrition.',
          niche: ['Fitness', 'Health', 'Sports'],
          location: 'Delhi, India',
          instagramUsername: 'dhruv.fitness',
          instagramFollowers: 220000,
          instagramUrl: 'https://instagram.com/dhruv.fitness',
          youtubeUsername: 'Dhruv Fit Life',
          youtubeSubscribers: 120000,
          youtubeUrl: 'https://youtube.com',
          totalFollowers: 340000,
          engagementRate: 5.9,
          aiScore: 93,
          fakeFollowerPercentage: 4.8,
          contentConsistency: 95,
          isFeatured: true,
          collaborationCount: 22,
          postRate: 25000,
          storyRate: 9000,
          videoRate: 40000,
          audienceLocations: [
            { country: 'India', percentage: 82 },
            { country: 'USA', percentage: 10 },
            { country: 'Canada', percentage: 5 },
            { country: 'Other', percentage: 3 }
          ],
          tags: ['fitness', 'workout', 'delhi', 'nutrition', 'health']
        }
      },
      {
        name: 'Smit Patel',
        email: 'smit@creator.com',
        password: 'demo123',
        role: 'creator',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        profile: {
          bio: 'Esports athlete & gaming live streamer. Playing BGMI, Valorant, GTA V, and reviewing gaming gear.',
          niche: ['Gaming', 'Esports', 'Tech'],
          location: 'Bengaluru, Karnataka, India',
          instagramUsername: 'smit.gaming',
          instagramFollowers: 135000,
          instagramUrl: 'https://instagram.com/smit.gaming',
          youtubeUsername: 'Smit Live Gaming',
          youtubeSubscribers: 80000,
          youtubeUrl: 'https://youtube.com',
          totalFollowers: 215000,
          engagementRate: 7.1,
          aiScore: 88,
          fakeFollowerPercentage: 5.8,
          contentConsistency: 90,
          isFeatured: true,
          collaborationCount: 16,
          postRate: 19000,
          storyRate: 7000,
          videoRate: 32000,
          audienceLocations: [
            { country: 'India', percentage: 90 },
            { country: 'Nepal', percentage: 5 },
            { country: 'Other', percentage: 5 }
          ],
          tags: ['gaming', 'esports', 'bengaluru', 'streaming', 'pc']
        }
      },
      {
        name: 'Ravi Kumar',
        email: 'ravi@creator.com',
        password: 'demo123',
        role: 'creator',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        profile: {
          bio: 'Personal finance expert, stock market educator & crypto enthusiast. Making smart investing simple for young Indians.',
          niche: ['Finance', 'Business', 'Education'],
          location: 'Pune, Maharashtra, India',
          instagramUsername: 'ravi.finance',
          instagramFollowers: 125000,
          instagramUrl: 'https://instagram.com/ravi.finance',
          youtubeUsername: 'Ravi Money Talks',
          youtubeSubscribers: 70000,
          youtubeUrl: 'https://youtube.com',
          totalFollowers: 195000,
          engagementRate: 5.0,
          aiScore: 87,
          fakeFollowerPercentage: 6.0,
          contentConsistency: 89,
          isFeatured: false,
          collaborationCount: 12,
          postRate: 17000,
          storyRate: 6500,
          videoRate: 30000,
          audienceLocations: [
            { country: 'India', percentage: 88 },
            { country: 'Singapore', percentage: 6 },
            { country: 'Other', percentage: 6 }
          ],
          tags: ['finance', 'stocks', 'pune', 'investing', 'crypto']
        }
      }
    ];

    const createdCreators = [];
    for (const data of creatorsData) {
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        isVerified: data.isVerified,
        avatar: data.avatar
      });
      await CreatorProfile.create({
        userId: user.id,
        ...data.profile
      });
      createdCreators.push(user);
      console.log(`✅ Creator created: ${data.name} (${data.email})`);
    }

    // 3. Brands Data (Krish Tech, Manav Apparels, Utsav Foods, Dhruv Fitness Brands, Smit Electronics, Ravi Capital)
    const brandsData = [
      {
        name: 'Krish Tech Media',
        email: 'krish@brand.com',
        password: 'demo123',
        role: 'brand',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        profile: {
          companyName: 'Krish Tech Media & Software',
          industry: 'Technology & AI',
          website: 'https://krishtech.io',
          description: 'Pioneering AI productivity tools, cloud software, and developer platforms for modern creators.',
          location: 'Surat & Bengaluru, India',
          budgetMin: 30000,
          budgetMax: 200000,
          campaignCount: 1
        }
      },
      {
        name: 'Manav Streetwear Co',
        email: 'manav@brand.com',
        password: 'demo123',
        role: 'brand',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=150',
        profile: {
          companyName: 'Manav Urban Threads Ltd',
          industry: 'Fashion & Apparel',
          website: 'https://manavurbanthreads.com',
          description: 'Contemporary streetwear brand bringing sustainable oversized tees, hoodies, and jackets to Indian youth.',
          location: 'Mumbai, India',
          budgetMin: 20000,
          budgetMax: 150000,
          campaignCount: 1
        }
      },
      {
        name: 'Utsav Organic Living',
        email: 'utsav@brand.com',
        password: 'demo123',
        role: 'brand',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150',
        profile: {
          companyName: 'Utsav Farm & Organics',
          industry: 'Food & Beverage',
          website: 'https://utsavorganics.in',
          description: 'Farm-to-table natural snacks, cold-pressed oils, and health drinks without chemicals or preservatives.',
          location: 'Ahmedabad, India',
          budgetMin: 15000,
          budgetMax: 100000,
          campaignCount: 1
        }
      },
      {
        name: 'Dhruv Sports & Nutrition',
        email: 'dhruv@brand.com',
        password: 'demo123',
        role: 'brand',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150',
        profile: {
          companyName: 'Dhruv Pro Athletics',
          industry: 'Health & Fitness',
          website: 'https://dhruvproathletics.com',
          description: 'Premium clean whey protein, gym supplements, and performance sportswear engineered for athletes.',
          location: 'Delhi, India',
          budgetMin: 25000,
          budgetMax: 250000,
          campaignCount: 1
        }
      },
      {
        name: 'Smit NextGen Hardware',
        email: 'smit@brand.com',
        password: 'demo123',
        role: 'brand',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150',
        profile: {
          companyName: 'Smit Electronics Innovations',
          industry: 'Gaming Hardware & Gadgets',
          website: 'https://smithardware.in',
          description: 'High performance wireless mechanical keyboards, RGB headsets, and pro gaming mice designed in India.',
          location: 'Bengaluru, India',
          budgetMin: 20000,
          budgetMax: 180000,
          campaignCount: 1
        }
      },
      {
        name: 'Ravi Capital & Wealth',
        email: 'ravi@brand.com',
        password: 'demo123',
        role: 'brand',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150',
        profile: {
          companyName: 'Ravi SmartInvest Technologies',
          industry: 'Fintech & Investments',
          website: 'https://ravismartinvest.com',
          description: 'Zero brokerage automated micro-investing platform helping young professionals build retirement wealth effortlessly.',
          location: 'Pune, India',
          budgetMin: 30000,
          budgetMax: 220000,
          campaignCount: 1
        }
      }
    ];

    const createdBrands = [];
    for (const data of brandsData) {
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        isVerified: data.isVerified,
        avatar: data.avatar
      });
      await BrandProfile.create({
        userId: user.id,
        ...data.profile
      });
      createdBrands.push(user);
      console.log(`✅ Brand created: ${data.name} (${data.email})`);
    }

    // 4. Create 6 Campaigns (one per brand)
    const campaignsData = [
      {
        brandId: createdBrands[0].id, // Krish Tech
        title: 'NextGen AI Workspace App Launch',
        description: 'Looking for tech innovators and developers to showcase our new AI workspace app. We want authentic feature walkthroughs, workflow hacks, and reel reviews.',
        niche: ['Tech', 'AI', 'Gadgets'],
        platforms: ['instagram', 'youtube'],
        budgetMin: 30000,
        budgetMax: 90000,
        budgetCurrency: 'INR',
        reqMinFollowers: 15000,
        reqMinEngagement: 2.5,
        reqLocation: ['India', 'USA'],
        deliverables: ['1 Detailed YouTube Review', '2 Instagram Reels', '3 Story Updates'],
        status: 'active',
        views: 312,
        isBoosted: true,
        tags: ['tech', 'ai', 'saas', 'productivity']
      },
      {
        brandId: createdBrands[1].id, // Manav Streetwear
        title: 'Autumn Streetwear & Oversized Drops',
        description: 'Seeking urban fashion creators to style our latest oversized graphic tees, utility cargo pants, and hoodies in aesthetic street settings.',
        niche: ['Fashion', 'Lifestyle'],
        platforms: ['instagram', 'tiktok'],
        budgetMin: 20000,
        budgetMax: 65000,
        budgetCurrency: 'INR',
        reqMinFollowers: 10000,
        reqMinEngagement: 3.0,
        reqLocation: ['India'],
        deliverables: ['3 Outfit Transition Reels', '4 Instagram Grid Photos'],
        status: 'active',
        views: 245,
        isBoosted: true,
        tags: ['fashion', 'streetwear', 'ootd', 'style']
      },
      {
        brandId: createdBrands[2].id, // Utsav Organics
        title: 'Farm Fresh Organic Snack Challenge',
        description: 'Join our clean eating movement! Showcase our delicious roasted seed mixes and pure cold-pressed fruit drinks as your daily healthy snacking alternative.',
        niche: ['Food', 'Health', 'Lifestyle'],
        platforms: ['instagram', 'youtube'],
        budgetMin: 15000,
        budgetMax: 50000,
        budgetCurrency: 'INR',
        reqMinFollowers: 8000,
        reqMinEngagement: 3.2,
        reqLocation: ['India'],
        deliverables: ['2 Creative Recipe / Snack Reels', '3 Story Unboxings'],
        status: 'active',
        views: 188,
        isBoosted: false,
        tags: ['food', 'organic', 'snack', 'healthy']
      },
      {
        brandId: createdBrands[3].id, // Dhruv Sports
        title: '30-Day Pure Iso-Whey Fitness Transformation',
        description: 'Calling dedicated fitness coaches and athletes to test our ultra-pure whey protein isolate. Track your weekly physique gains and recovery progress.',
        niche: ['Fitness', 'Health', 'Sports'],
        platforms: ['instagram', 'youtube'],
        budgetMin: 35000,
        budgetMax: 110000,
        budgetCurrency: 'INR',
        reqMinFollowers: 12000,
        reqMinEngagement: 3.5,
        reqLocation: ['India'],
        deliverables: ['1 Full Workout Vlog with Shake Demo', '3 Progress Reels'],
        status: 'active',
        views: 420,
        isBoosted: true,
        tags: ['fitness', 'whey', 'workout', 'transformation']
      },
      {
        brandId: createdBrands[4].id, // Smit Hardware
        title: 'Wireless Mechanical RGB Keyboard Battle Station Tour',
        description: 'Calling PC gamers and desk setup enthusiasts! Unbox and sound-test our flagship hot-swappable tri-mode mechanical keyboard on camera.',
        niche: ['Gaming', 'Tech'],
        platforms: ['youtube', 'instagram'],
        budgetMin: 25000,
        budgetMax: 85000,
        budgetCurrency: 'INR',
        reqMinFollowers: 15000,
        reqMinEngagement: 3.0,
        reqLocation: ['India'],
        deliverables: ['1 Sound ASMR & Latency Test Video', '2 Desk Setup Reels'],
        status: 'active',
        views: 395,
        isBoosted: true,
        tags: ['gaming', 'keyboard', 'setup', 'pc']
      },
      {
        brandId: createdBrands[5].id, // Ravi Capital
        title: 'Smart SIP Investing for Gen-Z Made Easy',
        description: 'Demystify index funds and recurring SIP investments for first-time earners. Create punchy, insightful reels breaking down compound interest.',
        niche: ['Finance', 'Education', 'Business'],
        platforms: ['instagram', 'youtube'],
        budgetMin: 25000,
        budgetMax: 80000,
        budgetCurrency: 'INR',
        reqMinFollowers: 10000,
        reqMinEngagement: 2.8,
        reqLocation: ['India'],
        deliverables: ['3 Financial Education Reels', '1 In-depth Explainer Carousel'],
        status: 'active',
        views: 290,
        isBoosted: false,
        tags: ['finance', 'investing', 'money', 'sip']
      }
    ];

    const createdCampaigns = await Campaign.bulkCreate(campaignsData);
    console.log(`✅ Created ${createdCampaigns.length} campaigns across all brands`);

    // 5. Create 6 Applications (Pairing Creators with Campaigns)
    const applicationsData = [
      {
        campaignId: createdCampaigns[0].id, // Krish Tech Campaign
        creatorId: createdCreators[0].id,  // Krish Creator
        brandId: createdBrands[0].id,
        proposal: 'Hey Krish Tech! As an active software dev and tech reviewer, I can demonstrate real developer workflows on my YouTube channel and high retention Reels.',
        proposedRate: 50000,
        deliverables: ['1 Detailed Review Video', '2 Reels', '3 Stories'],
        timeline: '10 days',
        status: 'completed',
        dealAmount: 50000,
        completedAt: new Date(Date.now() - 3 * 86400000),
        ratingBrandScore: 5.0,
        ratingBrandReview: 'Outstanding content delivery! Clear sound, great visuals, and high engagement.',
        ratingCreatorScore: 5.0,
        ratingCreatorReview: 'Prompt payment and smooth brief. Loved working with Krish Tech!'
      },
      {
        campaignId: createdCampaigns[1].id, // Manav Streetwear Campaign
        creatorId: createdCreators[1].id,  // Manav Creator
        brandId: createdBrands[1].id,
        proposal: 'Love the oversize drop! I have shot street style reels across Colaba and Bandra with great engagement. Excited to style your collection.',
        proposedRate: 35000,
        deliverables: ['3 Transition Reels', '4 Grid Photos'],
        timeline: '7 days',
        status: 'accepted',
        dealAmount: 35000
      },
      {
        campaignId: createdCampaigns[2].id, // Utsav Organics Campaign
        creatorId: createdCreators[2].id,  // Utsav Creator
        brandId: createdBrands[2].id,
        proposal: 'I travel constantly and live by healthy snacks! I can film high aesthetic outdoor breakfast and travel snacking reels with your products.',
        proposedRate: 25000,
        deliverables: ['2 Recipe Reels', '3 Story Unboxings'],
        timeline: '5 days',
        status: 'accepted',
        dealAmount: 25000
      },
      {
        campaignId: createdCampaigns[3].id, // Dhruv Sports Campaign
        creatorId: createdCreators[3].id,  // Dhruv Creator
        brandId: createdBrands[3].id,
        proposal: 'I coach 400+ fitness trainees and have daily 100k+ story views. Would love to test your Iso-Whey and share laboratory purity analysis with my audience.',
        proposedRate: 60000,
        deliverables: ['1 Full Workout Vlog', '3 Progress Reels'],
        timeline: '14 days',
        status: 'accepted',
        dealAmount: 60000
      },
      {
        campaignId: createdCampaigns[4].id, // Smit Hardware Campaign
        creatorId: createdCreators[4].id,  // Smit Creator
        brandId: createdBrands[4].id,
        proposal: 'I stream competitive FPS 6 days a week! I will use this mechanical keyboard during live matches and post a dedicated setup sound test.',
        proposedRate: 45000,
        deliverables: ['1 Sound Test Video', '2 Setup Reels'],
        timeline: '7 days',
        status: 'pending'
      },
      {
        campaignId: createdCampaigns[5].id, // Ravi Capital Campaign
        creatorId: createdCreators[5].id,  // Ravi Creator
        brandId: createdBrands[5].id,
        proposal: 'My followers regularly ask for trusted SIP apps. I can create a step-by-step beginners guide breaking down index fund investments effortlessly.',
        proposedRate: 40000,
        deliverables: ['3 Educational Reels', '1 Carousel'],
        timeline: '6 days',
        status: 'accepted',
        dealAmount: 40000
      }
    ];

    const createdApplications = [];
    for (const app of applicationsData) {
      const createdApp = await Application.create(app);
      createdApplications.push(createdApp);
    }
    console.log(`✅ Created ${createdApplications.length} applications`);

    // 6. Create Content Submissions for Applications
    const contentSubmissionsData = [
      {
        applicationId: createdApplications[0].id,
        campaignId: createdApplications[0].campaignId,
        creatorId: createdApplications[0].creatorId,
        brandId: createdApplications[0].brandId,
        title: 'Krish Tech App Review & Workflow Tutorial',
        description: 'Submitted full 4K YouTube video link and raw vertical Reel cuts demonstrating all core features.',
        contentLinks: ['https://youtube.com/watch?v=demo_krish_tech', 'https://instagram.com/reel/demo_tech1'],
        deliverable: '1 Detailed Review Video, 2 Reels',
        status: 'approved',
        brandFeedback: 'Brilliant demonstration and great pacing. Approved for final release!',
        approvedAt: new Date(Date.now() - 2 * 86400000),
        submittedAt: new Date(Date.now() - 4 * 86400000)
      },
      {
        applicationId: createdApplications[1].id,
        campaignId: createdApplications[1].campaignId,
        creatorId: createdApplications[1].creatorId,
        brandId: createdApplications[1].brandId,
        title: 'Autumn Drop Outfit Reels & Street Walk',
        description: 'Uploaded draft cut of the transition reel with music sync and color grading matching the brand palette.',
        contentLinks: ['https://instagram.com/reel/demo_manav_fits'],
        deliverable: '3 Transition Reels',
        status: 'under_review',
        submittedAt: new Date(Date.now() - 1 * 86400000)
      },
      {
        applicationId: createdApplications[2].id,
        campaignId: createdApplications[2].campaignId,
        creatorId: createdApplications[2].creatorId,
        brandId: createdApplications[2].brandId,
        title: 'Morning Mountain Trail Healthy Snack Reel',
        description: 'Draft video featuring unboxing on an outdoor hiking trip with natural sunlight.',
        contentLinks: ['https://instagram.com/reel/demo_utsav_hike'],
        deliverable: '2 Recipe Reels',
        status: 'submitted',
        submittedAt: new Date()
      }
    ];

    for (const cs of contentSubmissionsData) {
      await ContentSubmission.create(cs);
    }
    console.log(`✅ Created sample content submissions`);

    // 7. Create Payments in Escrow (Held and Released)
    const paymentsData = [
      {
        applicationId: createdApplications[0].id,
        campaignId: createdApplications[0].campaignId,
        brandId: createdApplications[0].brandId,
        creatorId: createdApplications[0].creatorId,
        amount: 50000,
        platformFee: 5000,
        creatorAmount: 45000,
        status: 'released',
        paymentMethodType: 'card',
        paymentMethodLast4: '4242',
        paidAt: new Date(Date.now() - 5 * 86400000),
        heldAt: new Date(Date.now() - 5 * 86400000),
        releasedAt: new Date(Date.now() - 2 * 86400000),
        creatorBankAccountName: 'Krish Vaghasiya',
        creatorBankAccountNumber: '918237465012',
        creatorBankIfsc: 'HDFC0001234',
        creatorBankUpiId: 'krish@okaxis'
      },
      {
        applicationId: createdApplications[1].id,
        campaignId: createdApplications[1].campaignId,
        brandId: createdApplications[1].brandId,
        creatorId: createdApplications[1].creatorId,
        amount: 35000,
        platformFee: 3500,
        creatorAmount: 31500,
        status: 'held',
        paymentMethodType: 'upi',
        paymentMethodUpiId: 'manavbrand@upi',
        paidAt: new Date(Date.now() - 2 * 86400000),
        heldAt: new Date(Date.now() - 2 * 86400000),
        creatorBankAccountName: 'Manav Sharma',
        creatorBankUpiId: 'manav@okicici'
      },
      {
        applicationId: createdApplications[3].id,
        campaignId: createdApplications[3].campaignId,
        brandId: createdApplications[3].brandId,
        creatorId: createdApplications[3].creatorId,
        amount: 60000,
        platformFee: 6000,
        creatorAmount: 54000,
        status: 'held',
        paymentMethodType: 'netbanking',
        paymentMethodBank: 'State Bank of India',
        paidAt: new Date(Date.now() - 1 * 86400000),
        heldAt: new Date(Date.now() - 1 * 86400000),
        creatorBankAccountName: 'Dhruv Verma',
        creatorBankUpiId: 'dhruv@paytm'
      }
    ];

    for (const p of paymentsData) {
      await Payment.create(p);
    }
    console.log(`✅ Created sample payments in escrow`);

    // 8. Create Messages & Chat Threads
    const conversationId1 = `conv_${createdCreators[0].id}_${createdBrands[0].id}`;
    const conversationId2 = `conv_${createdCreators[1].id}_${createdBrands[1].id}`;

    await Message.bulkCreate([
      {
        conversationId: conversationId1,
        senderId: createdBrands[0].id,
        receiverId: createdCreators[0].id,
        message: 'Hello Krish! We are super excited to collaborate with you on our new AI productivity tool.',
        isRead: true
      },
      {
        conversationId: conversationId1,
        senderId: createdCreators[0].id,
        receiverId: createdBrands[0].id,
        message: 'Hi team! Delighted to be onboard. I have planned 2 high energy reels and 1 walkthrough video.',
        isRead: true
      },
      {
        conversationId: conversationId1,
        senderId: createdBrands[0].id,
        receiverId: createdCreators[0].id,
        message: 'Payment has been released to your escrow account. Wonderful work!',
        isRead: true
      },
      {
        conversationId: conversationId2,
        senderId: createdBrands[1].id,
        receiverId: createdCreators[1].id,
        message: 'Hey Manav! The courier with our new autumn jackets and hoodies was dispatched today.',
        isRead: true
      },
      {
        conversationId: conversationId2,
        senderId: createdCreators[1].id,
        receiverId: createdBrands[1].id,
        message: 'Awesome! Got the tracking number. Will start filming as soon as it arrives.',
        isRead: false
      }
    ]);
    console.log(`✅ Created sample messages`);

    console.log('\n======================================================');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('📋 CREATOR ACCOUNTS (Password: demo123):');
    console.log('  1. Krish Vaghasiya  : krish@creator.com');
    console.log('  2. Manav Sharma     : manav@creator.com');
    console.log('  3. Utsav Joshi      : utsav@creator.com');
    console.log('  4. Dhruv Verma      : dhruv@creator.com');
    console.log('  5. Smit Patel       : smit@creator.com');
    console.log('  6. Ravi Kumar       : ravi@creator.com');
    console.log('------------------------------------------------------');
    console.log('📋 BRAND ACCOUNTS (Password: demo123):');
    console.log('  1. Krish Tech Media : krish@brand.com');
    console.log('  2. Manav Streetwear : manav@brand.com');
    console.log('  3. Utsav Organics   : utsav@brand.com');
    console.log('  4. Dhruv Sports     : dhruv@brand.com');
    console.log('  5. Smit Hardware    : smit@brand.com');
    console.log('  6. Ravi Capital     : ravi@brand.com');
    console.log('------------------------------------------------------');
    console.log('📋 ADMIN ACCOUNT (Password: demo123):');
    console.log('  - Admin             : admin@demo.com');
    console.log('======================================================\n');

  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await sequelize.close();
  }
}

seed();
