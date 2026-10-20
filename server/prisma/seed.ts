/**
 * Database seed.
 *
 * The task spec says: "For now you can seed the admin directly in the
 * database" — so the MENTOR account(s) are created here and there is
 * intentionally NO API endpoint to register a mentor.
 *
 * Run with: pnpm db:seed
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STUDENT_PASSWORD = "Student123!";
const MENTOR_PASSWORD = "Mentor123!";

async function main() {
  console.log("🌱 Seeding database...");

  /* ------------------------------ Mentors ------------------------------ */

  const mentorHash = await bcrypt.hash(MENTOR_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@programming-hero.com" },
    update: {},
    create: {
      name: "Admin Mentor",
      email: "admin@programming-hero.com",
      passwordHash: mentorHash,
      role: "MENTOR",
    },
  });

  const mentor2 = await prisma.user.upsert({
    where: { email: "mentor@programming-hero.com" },
    update: {},
    create: {
      name: "Web Instructor",
      email: "mentor@programming-hero.com",
      passwordHash: mentorHash,
      role: "MENTOR",
    },
  });

  /* ----------------------------- Students ------------------------------ */

  const studentHash = await bcrypt.hash(STUDENT_PASSWORD, 10);
  const studentData = [
    { name: "Rafi Hasan", email: "rafi@student.com" },
    { name: "Nusrat Jahan", email: "nusrat@student.com" },
    { name: "Tanvir Alam", email: "tanvir@student.com" },
    { name: "Sadia Islam", email: "sadia@student.com" },
    { name: "Imran Hossain", email: "imran@student.com" },
    { name: "Farhan Ahmed", email: "farhan@student.com" },
  ];

  const students = [];
  for (const s of studentData) {
    students.push(
      await prisma.user.upsert({
        where: { email: s.email },
        update: {},
        create: { ...s, passwordHash: studentHash, role: "STUDENT" },
      }),
    );
  }

  /* ---------------------------- Submissions ---------------------------- */

  // Wipe submissions so re-seeding is deterministic.
  await prisma.reviewFeedback.deleteMany();
  await prisma.submission.deleteMany();

  const submissionData: Array<{
    studentIdx: number;
    projectName: string;
    repoUrl: string;
    liveUrl?: string;
    description: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reviewerIdx?: number;
    note?: string;
  }> = [
    {
      studentIdx: 0,
      projectName: "Monster House",
      repoUrl: "https://github.com/rafi-dev/monster-house",
      liveUrl: "https://monster-house-rafi.netlify.app",
      description:
        "An interactive horror game built with vanilla JavaScript and CSS animations. The player explores rooms, collects keys and escapes before the timer runs out.",
      status: "APPROVED",
      reviewerIdx: 0,
      note: "Great job with the timer logic and CSS transitions. Keep the code comments coming!",
    },
    {
      studentIdx: 0,
      projectName: "Phitron Portfolio",
      repoUrl: "https://github.com/rafi-dev/phitron-portfolio",
      liveUrl: "https://rafi-portfolio.netlify.app",
      description:
        "A responsive personal portfolio with dark mode, smooth scrolling sections and a contact form powered by Formspree.",
      status: "PENDING",
    },
    {
      studentIdx: 1,
      projectName: "DevDetective",
      repoUrl: "https://github.com/nusrat-j/dev-detective",
      liveUrl: "https://dev-detective-nusrat.netlify.app",
      description:
        "Search any GitHub profile and see repos, followers and stats. Built with the GitHub REST API, fetch/async-await and error handling for every failure case.",
      status: "APPROVED",
      reviewerIdx: 1,
      note: "Excellent fetch error handling — the 404 state is very clean.",
    },
    {
      studentIdx: 1,
      projectName: "Ice Cream Shop",
      repoUrl: "https://github.com/nusrat-j/ice-cream-shop",
      description:
        "A classic e-commerce landing page with a working cart, discount codes and a checkout summary computed in vanilla JavaScript.",
      status: "REJECTED",
      reviewerIdx: 0,
      note: "Layout breaks below 380px and the cart total does not update when removing items. Fix both and resubmit.",
    },
    {
      studentIdx: 2,
      projectName: "Knowledge Cafe",
      repoUrl: "https://github.com/tanvir-a/knowledge-cafe",
      liveUrl: "https://knowledge-cafe-tanvir.netlify.app",
      description:
        "A blog reader UI with dynamic topic filters, bookmarking stored in localStorage and skeleton loading states while content loads.",
      status: "APPROVED",
      reviewerIdx: 0,
      note: "Nice touch adding skeleton loaders. Bookmarking via localStorage is exactly right for this level.",
    },
    {
      studentIdx: 2,
      projectName: "Pin Puzzle Master",
      repoUrl: "https://github.com/tanvir-a/pin-puzzle-master",
      description:
        "A pin-verification mini game with a keypad UI, transaction history panel and three attempts before lockout. Practicing DOM events and conditional logic.",
      status: "PENDING",
    },
    {
      studentIdx: 3,
      projectName: "Sunrise Language School",
      repoUrl: "https://github.com/sadia-islam/sunrise-language-school",
      liveUrl: "https://sunrise-school-sadia.netlify.app",
      description:
        "Responsive landing page for a language school with a hero section, success stories carousel and mobile-first navigation built with Tailwind CSS.",
      status: "APPROVED",
      reviewerIdx: 1,
      note: "Very clean responsive breakpoints. Great use of Tailwind utilities.",
    },
    {
      studentIdx: 3,
      projectName: "Emergency Hotlines",
      repoUrl: "https://github.com/sadia-islam/emergency-hotlines",
      description:
        "A searchable directory of emergency service numbers with copy-to-clipboard cards. Built to practice template literals, arrays and object iteration.",
      status: "PENDING",
    },
    {
      studentIdx: 4,
      projectName: "Gadget Heaven",
      repoUrl: "https://github.com/imran-h/gadget-heaven",
      liveUrl: "https://gadget-heaven-imran.netlify.app",
      description:
        "An online shop for gadgets with category filtering, a context-based cart and a checkout flow. Built with React hooks and the Context API.",
      status: "REJECTED",
      reviewerIdx: 1,
      note: "Cart state resets on refresh — persist it to localStorage. Also remove the unused axios dependency.",
    },
    {
      studentIdx: 4,
      projectName: "Dream Flight Booking",
      repoUrl: "https://github.com/imran-h/dream-flight",
      description:
        "A flight booking form with live fare calculation, seat selection and a printable ticket summary. Practicing forms and state management.",
      status: "PENDING",
    },
    {
      studentIdx: 5,
      projectName: "Music Player UI",
      repoUrl: "https://github.com/farhan-a/music-player-ui",
      liveUrl: "https://music-player-farhan.netlify.app",
      description:
        "A pixel-styled music player with playlist support, progress bar seeking and keyboard shortcuts, all in vanilla JavaScript with no libraries.",
      status: "APPROVED",
      reviewerIdx: 0,
      note: "Keyboard shortcuts were not required — going beyond the brief. Well done.",
    },
    {
      studentIdx: 5,
      projectName: "Simple Blog Engine",
      repoUrl: "https://github.com/farhan-a/simple-blog-engine",
      description:
        "A markdown-powered static blog generator that reads posts from a folder and builds an index page. My first project touching Node.js and the file system.",
      status: "PENDING",
    },
  ];

  for (const s of submissionData) {
    await prisma.submission.create({
      data: {
        projectName: s.projectName,
        repoUrl: s.repoUrl,
        liveUrl: s.liveUrl ?? null,
        description: s.description,
        status: s.status,
        student: { connect: { id: students[s.studentIdx].id } },
        ...(s.reviewerIdx !== undefined
          ? {
              reviewer: { connect: { id: s.reviewerIdx === 1 ? mentor2.id : admin.id } },
              reviewedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            }
          : {}),
        ...(s.note
          ? {
              feedback: {
                create: {
                  comment: s.note,
                  reviewerId: s.reviewerIdx === 1 ? mentor2.id : admin.id,
                },
              },
            }
          : {}),
      },
    });
  }

  console.log("✅ Seed complete.\n");
  console.log("   👨‍🎓 Students   (password: Student123!)");
  for (const s of studentData) console.log(`      ${s.email}`);
  console.log("\n   🧑‍🏫 Mentors    (password: Mentor123!)");
  console.log("      admin@programming-hero.com");
  console.log("      mentor@programming-hero.com\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
