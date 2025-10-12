import { PrismaClient } from "@prisma/client/extension";

function randomDateWithinDays(days: number) {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * days * 24 * 60 * 60 * 1000);
  return past;
}

export async function seedFilmHistory(prisma: PrismaClient) { 
  const users = await prisma.user.findMany({ select: { id: true } });
  const episodes = await prisma.episode.findMany({ select: { id: true } });

  if (users.length === 0 || episodes.length === 0) {
    console.error("⚠️ Vui lòng đảm bảo có sẵn dữ liệu user và episode trước khi seed.");
    process.exit(1);
  }

  const histories: any = [];

  for (let i = 0; i < 60; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomEpisode = episodes[Math.floor(Math.random() * episodes.length)];

    histories.push({
      user_id: randomUser.id,
      episode_id: randomEpisode.id,
      created_at: randomDateWithinDays(30),
    });
  }

  await prisma.filmHistory.createMany({ data: histories });

  console.log("✅ Seeded 60 FilmHistory records successfully.");
}