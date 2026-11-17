export type DocumentType =
  "Abstract" | "Full Paper PDF" | "Presentation" | "Program" | "Workshop Recording Transcript";

export interface Author {
  name: string;
  affiliation: string;
}

export interface ArchiveRecord {
  submission_id: string;
  year: number;
  track: string;
  title: string;
  authors: Author[];
  document_type: DocumentType;
  keywords: string[];
  abstract: string;
  full_text_content: string;
}

/** Real conference years only. 2020, 2022 and 2023 never occurred. */
export const CONFERENCE_YEARS = [
  2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2021, 2024,
] as const;

export const TRACKS = [
  "Social Media & Public Sphere",
  "Journalism & News",
  "Politics & Civic Engagement",
  "Marginalized & Overlooked Communities",
  "AI & Algorithms",
  "Research Ethics",
] as const;

export const DOCUMENT_TYPES: DocumentType[] = [
  "Abstract",
  "Full Paper PDF",
  "Presentation",
  "Program",
  "Workshop Recording Transcript",
];

const HU = "Howard University";

export const mockRecords: ArchiveRecord[] = [
  {
    submission_id: "SMTCW-2012-007",
    year: 2012,
    track: "Social Media & Public Sphere",
    title: "Hashtags as Town Squares: Early Twitter and the Digital Public Sphere",
    authors: [{ name: "Marcus Ellison", affiliation: HU }],
    document_type: "Full Paper PDF",
    keywords: ["Twitter", "public sphere", "hashtags", "platform adoption"],
    abstract:
      "This paper examines how hashtags on Twitter function as ad hoc public squares. Drawing on 2011-2012 data, it argues that chronological feeds give marginal voices equal visibility, and predicts that this openness will persist as adoption grows.",
    full_text_content:
      "Twitter's chronological timeline presents every post in the order it was published. In our sample of 40,000 hashtagged tweets, accounts with fewer than 500 followers accounted for 38 percent of the most-retweeted messages.\n\nWe argue that the hashtag operates as a town square: anyone can enter, and the architecture does not rank speakers. We expect that this openness will persist as adoption grows, because the platform's value proposition rests on real-time, unfiltered conversation.\n\nLimitations include the short observation window and the reliance on the public streaming API, which samples roughly one percent of traffic.",
  },
  {
    submission_id: "SMTCW-2013-015",
    year: 2013,
    track: "Marginalized & Overlooked Communities",
    title: "Black Twitter as Counterpublic: Networked Voice and Cultural Commentary",
    authors: [
      { name: "Danielle Brooks", affiliation: HU },
      { name: "Kofi Mensah", affiliation: "Morgan State University" },
    ],
    document_type: "Full Paper PDF",
    keywords: ["Black Twitter", "counterpublic", "cultural commentary", "Twitter"],
    abstract:
      "We describe Black Twitter as a networked counterpublic that uses humor, signifying and hashtag campaigns to shape mainstream news agendas. Interviews with 22 users show deliberate strategies for visibility.",
    full_text_content:
      "Black Twitter is not a separate platform but a set of overlapping networks bound by shared cultural references. Our interviewees described 'getting a hashtag to trend' as a collective, coordinated act.\n\nNewsrooms increasingly monitor these conversations; six of the stories we tracked were picked up by national outlets within 48 hours of trending.\n\nWe caution that researchers must avoid extracting community discourse without context or consent, a theme we return to in our ethics discussion.",
  },
  {
    submission_id: "SMTCW-2014-022",
    year: 2014,
    track: "Journalism & News",
    title: "From Wire to Feed: How Newsrooms Adopted Social Distribution",
    authors: [{ name: "Ruth Okafor", affiliation: "University of Maryland" }],
    document_type: "Presentation",
    keywords: ["journalism", "news distribution", "Facebook", "platform adoption"],
    abstract:
      "This presentation surveys 30 regional newsrooms on social distribution. Editors predicted social platforms would become supplementary traffic sources rather than primary gatekeepers.",
    full_text_content:
      "Most editors described Facebook and Twitter as 'a second front page' that would complement, not replace, homepage traffic.\n\nOnly three of the thirty newsrooms had a dedicated social media editor in 2014. Several respondents predicted that platforms would remain neutral pipes for publisher content.\n\nWe recommend that newsrooms track referral share closely, as dependence on a single platform introduces risk.",
  },
  {
    submission_id: "SMTCW-2015-042",
    year: 2015,
    track: "AI & Algorithms",
    title: "Predicting Twitter Feed Algorithms and Platform Adoption",
    authors: [
      { name: "Ingrid Sturgis", affiliation: HU },
      { name: "Jamal Whitfield", affiliation: HU },
    ],
    document_type: "Full Paper PDF",
    keywords: ["Twitter", "feed algorithms", "platform adoption", "prediction"],
    abstract:
      "Anticipating Twitter's shift from chronological to ranked feeds, this paper forecasts effects on adoption and visibility. We predict ranked feeds will modestly increase engagement but concentrate attention among already-popular accounts.",
    full_text_content:
      "Facebook's News Feed ranking offers a preview of what an algorithmic Twitter might look like. We predict that a ranked timeline will modestly increase engagement while concentrating visibility among accounts that already have large followings.\n\nWe further predict that users from smaller communities, including HBCU student groups, will need to adapt posting strategies to remain visible.\n\nOn adoption, we forecast that Twitter growth in the U.S. will plateau by 2018 as younger users move toward visual platforms such as Instagram and Snapchat.",
  },
  {
    submission_id: "SMTCW-2015-051",
    year: 2015,
    track: "Marginalized & Overlooked Communities",
    title: "HBCU Students and the Campus Social Graph",
    authors: [{ name: "Tasha Greene", affiliation: HU }],
    document_type: "Abstract",
    keywords: ["HBCU students", "campus life", "Instagram", "platform adoption"],
    abstract:
      "A survey of 410 HBCU students maps platform use across academic and social life. Students reported using Instagram for identity expression and Twitter for news and activism.",
    full_text_content:
      "Respondents described a division of labor across platforms: Instagram for self-presentation, Twitter for news and campus activism, and GroupMe for coordination.\n\n71 percent reported first hearing about campus protests on Twitter. Students predicted they would keep Twitter for news even if friends moved elsewhere.",
  },
  {
    submission_id: "SMTCW-2016-018",
    year: 2016,
    track: "Politics & Civic Engagement",
    title: "Election Season on the Timeline: Civic Talk and Viral Falsehoods",
    authors: [{ name: "Andre Collins", affiliation: "Georgetown University" }],
    document_type: "Full Paper PDF",
    keywords: ["elections", "misinformation", "civic engagement", "Facebook"],
    abstract:
      "Tracking 2016 election content, this paper finds fabricated stories spread farther than corrections. It predicts platforms will adopt fact-checking labels within two years.",
    full_text_content:
      "Fabricated election stories in our sample received on average 2.3 times more shares than their subsequent corrections.\n\nWe predict that platforms will introduce visible fact-checking labels within two years, and that such labels will reduce sharing of flagged content by a meaningful margin.\n\nCivic organizations interviewed expressed concern that misinformation disproportionately targeted Black voters.",
  },
  {
    submission_id: "SMTCW-2017-030",
    year: 2017,
    track: "Marginalized & Overlooked Communities",
    title: "Logging On Later: Older Adults and Rural Users on Facebook",
    authors: [{ name: "Linda Harper", affiliation: "Virginia State University" }],
    document_type: "Workshop Recording Transcript",
    keywords: ["older adults", "rural users", "Facebook", "digital divide"],
    abstract:
      "Workshop transcript discussing older and rural users. Participants noted bandwidth limits and trust in local Facebook groups as the main drivers of adoption.",
    full_text_content:
      "MODERATOR: What brought you onto Facebook?\n\nPARTICIPANT 3: My church group moved there. That was it. I don't trust the news on it, but I trust the people in my group.\n\nHARPER: Rural participants consistently named limited broadband as a reason they read but rarely post video. We expect adoption among older adults to keep rising, but research rarely samples these users.",
  },
  {
    submission_id: "SMTCW-2018-011",
    year: 2018,
    track: "Research Ethics",
    title: "Consent in the Public Feed: Ethics of Scraping Community Data",
    authors: [{ name: "Priya Raman", affiliation: "American University" }],
    document_type: "Presentation",
    keywords: ["research ethics", "data scraping", "consent", "Black Twitter"],
    abstract:
      "This presentation argues that 'public' posts are not ethically equivalent to consented data, especially for marginalized communities. It proposes a contextual consent checklist.",
    full_text_content:
      "Public visibility does not equal consent. Users in our focus groups expected researchers to ask before quoting them.\n\nWe propose a checklist: assess community vulnerability, paraphrase rather than quote where possible, and report findings back to the community.",
  },
  {
    submission_id: "SMTCW-2019-024",
    year: 2019,
    track: "AI & Algorithms",
    title: "Who Gets Seen? Auditing Ranked Timelines Four Years On",
    authors: [{ name: "Jamal Whitfield", affiliation: HU }],
    document_type: "Full Paper PDF",
    keywords: ["feed algorithms", "algorithmic audit", "Twitter", "visibility"],
    abstract:
      "An audit of ranked Twitter timelines finds that the top 10 percent of accounts receive 62 percent of impressions in sampled feeds, compared with 41 percent under chronological ordering.",
    full_text_content:
      "Using 120 sock-puppet accounts, we compared ranked and chronological timelines. Under ranking, the top 10 percent of accounts received 62 percent of impressions, versus 41 percent chronologically.\n\nAccounts tied to HBCU student organizations saw a 27 percent drop in impressions after ranking was enabled by default.\n\nThese results confirm earlier predictions that ranking concentrates visibility.",
  },
  {
    submission_id: "SMTCW-2019-033",
    year: 2019,
    track: "Journalism & News",
    title: "The Platform Is the Publisher: News Dependence After Algorithm Changes",
    authors: [{ name: "Ruth Okafor", affiliation: "University of Maryland" }],
    document_type: "Abstract",
    keywords: ["journalism", "news distribution", "feed algorithms", "Facebook"],
    abstract:
      "Revisiting 2014 newsrooms, this study finds that Facebook's 2018 feed change cut referral traffic by up to 40 percent, contradicting earlier expectations that platforms would remain neutral pipes.",
    full_text_content:
      "Of the original thirty newsrooms, nine had closed or merged. Survivors reported referral losses of 20 to 40 percent after Facebook prioritized 'meaningful interactions'.\n\nEditors now describe platforms as de facto publishers whose ranking decisions shape newsroom strategy.",
  },
  {
    submission_id: "SMTCW-2021-009",
    year: 2021,
    track: "Politics & Civic Engagement",
    title: "Labels, Limits and Lies: Measuring Misinformation Interventions",
    authors: [{ name: "Andre Collins", affiliation: "Georgetown University" }],
    document_type: "Full Paper PDF",
    keywords: ["misinformation", "fact-checking labels", "elections", "content moderation"],
    abstract:
      "Evaluating platform interventions during the 2020 U.S. election, we find warning labels reduced resharing by 12 to 18 percent, smaller than predicted, while friction prompts were more effective.",
    full_text_content:
      "Labels arrived as predicted, but their effect was modest: resharing of labeled posts fell 12 to 18 percent.\n\nFriction prompts asking users to read before sharing reduced resharing by roughly 30 percent.\n\nTargeted misinformation toward Black voters remained a significant concern, echoing 2016 findings.",
  },
  {
    submission_id: "SMTCW-2021-017",
    year: 2021,
    track: "Marginalized & Overlooked Communities",
    title: "Pandemic Connectivity: HBCU Students and Remote Learning Online",
    authors: [{ name: "Tasha Greene", affiliation: HU }],
    document_type: "Presentation",
    keywords: ["HBCU students", "remote learning", "TikTok", "digital divide"],
    abstract:
      "Students shifted community life to TikTok and Instagram during remote learning. Twitter remained a news source but lost ground for social connection.",
    full_text_content:
      "Compared with our 2015 survey, Twitter use for news held steady while TikTok became the leading platform for social connection.\n\nStudents with limited home broadband reported participation gaps, linking HBCU experiences to rural connectivity research.",
  },
  {
    submission_id: "SMTCW-2024-004",
    year: 2024,
    track: "AI & Algorithms",
    title: "Recommendation Engines and the End of the Follow Graph",
    authors: [
      { name: "Jamal Whitfield", affiliation: HU },
      { name: "Mei Lin", affiliation: "Johns Hopkins University" },
    ],
    document_type: "Full Paper PDF",
    keywords: ["feed algorithms", "AI recommendation", "TikTok", "platform adoption"],
    abstract:
      "Modern feeds increasingly rely on machine learning recommendation rather than social graphs. Over 50 percent of content seen on major platforms now comes from accounts users do not follow.",
    full_text_content:
      "The 'For You' model, popularized by TikTok, has been adopted across X, Instagram and Facebook. In our panel, 54 percent of impressions came from unfollowed accounts.\n\nThis goes further than 2015 predictions, which anticipated ranking within the follow graph rather than replacement of it.\n\nTwitter's U.S. user growth did plateau around 2018-2019, consistent with earlier forecasts.",
  },
  {
    submission_id: "SMTCW-2024-012",
    year: 2024,
    track: "Politics & Civic Engagement",
    title: "Synthetic Persuasion: Generative AI and Election Misinformation",
    authors: [{ name: "Priya Raman", affiliation: "American University" }],
    document_type: "Workshop Recording Transcript",
    keywords: ["misinformation", "generative AI", "elections", "deepfakes"],
    abstract:
      "Workshop discussion of AI-generated election content. Panelists reported synthetic audio targeting older and rural voters, and debated provenance labeling.",
    full_text_content:
      "RAMAN: The cheapest attack we saw this cycle was synthetic audio, robocalls in a candidate's voice targeting older voters.\n\nPANELIST 2: Rural and older audiences are least likely to have seen fact-check labels, so provenance needs to travel with the media itself.\n\nRAMAN: Labels helped modestly in 2020; generative content makes the problem harder.",
  },
  {
    submission_id: "SMTCW-2024-020",
    year: 2024,
    track: "Research Ethics",
    title: "Grounded Answers: Ethics of AI Tools for Archival Research",
    authors: [{ name: "Ingrid Sturgis", affiliation: HU }],
    document_type: "Program",
    keywords: ["research ethics", "generative AI", "citation", "archives"],
    abstract:
      "Program session on responsible AI for archives. Recommends that any AI research tool cite primary documents and refuse to answer beyond its sources.",
    full_text_content:
      "Session overview: AI assistants can make archives searchable, but only if every claim is traceable to a source.\n\nRecommendations: cite the original document for each claim, show the passage used, and say 'not found in the archive' rather than guess.",
  },
  {
    submission_id: "SMTCW-2016-027",
    year: 2016,
    track: "AI & Algorithms",
    title: "Out of Order: First Reactions to Twitter's Ranked Timeline",
    authors: [{ name: "Danielle Brooks", affiliation: HU }],
    document_type: "Presentation",
    keywords: ["feed algorithms", "Twitter", "visibility", "Black Twitter"],
    abstract:
      "Presentation slides analyzing the first months of Twitter's ranked timeline. Predicts that civic and community hashtags will lose reach as engagement signals decide what users see.",
    full_text_content:
      "Slide 2: In February 2016 Twitter introduced a ranked timeline that shows 'the best tweets first'.\n\nSlide 5: We predict that community hashtags such as those used by Black Twitter will lose reach unless they generate high early engagement.\n\nSlide 8: Ranking rewards speed and volume of reactions, not civic importance.",
  },
  {
    submission_id: "SMTCW-2021-025",
    year: 2021,
    track: "AI & Algorithms",
    title: "Engagement Ranking Revisited: A Pandemic-Era Timeline Audit",
    authors: [
      { name: "Jamal Whitfield", affiliation: HU },
      { name: "Danielle Brooks", affiliation: HU },
    ],
    document_type: "Full Paper PDF",
    keywords: ["feed algorithms", "algorithmic audit", "Twitter", "visibility", "Black Twitter"],
    abstract:
      "A follow-up audit finds that concentration of impressions kept rising after 2019, while community hashtags still trended when early engagement was high.",
    full_text_content:
      "Repeating our 2019 method, the top 10 percent of accounts received 71 percent of impressions in ranked timelines.\n\nCommunity hashtags were not erased: Black Twitter hashtags still trended when they gathered strong early engagement, which only partly matches the 2016 forecast.\n\nRecommended content from outside the follow graph began to appear in timelines, a shift we flag for future study.",
  },
];
