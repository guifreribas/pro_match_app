import { Team } from '@app/models/team';

type Match = {
  home: Team;
  away: Team;
};

type Round = {
  dates: Date[];
  matches: { date: Date; match: Match }[];
};

interface GenerateLeagueCalendarParams {
  teams: Team[];
  startDate: Date;
  excludeDates: Date[];
  validWeekDays: number[];
  isDoubleRound: boolean;
  userId: number;
}

export function generateRounds(teams: Team[], userId: number): Match[][] {
  const rounds: Match[][] = [];
  const isOdd = teams.length % 2 !== 0;
  const teamList = teams.slice();
  if (isOdd) {
    teamList.push({ name: 'BYE', avatar: '', user_id: userId });
  }

  const totalTeams = teamList.length;
  const halfSize = totalTeams / 2;

  const numberOfRounds = totalTeams - 1;

  for (let round = 0; round < numberOfRounds; round++) {
    const matches: Match[] = [];
    for (let i = 0; i < halfSize; i++) {
      const home = teamList[i];
      const away = teamList[i + halfSize];
      if (home.name !== 'BYE' && away.name !== 'BYE') {
        matches.push({ home, away });
      }
    }
    rounds.push(matches);

    //Rotate the team list except first one
    teamList.splice(1, 0, teamList.pop()!);
  }

  return rounds;
}

export function generateRoundDates(
  numberOfRounds: number,
  startDate: Date,
  excludeDates: Date[],
  validWeekDays: number[]
): Date[][] {
  const roundDates: Date[][] = [];

  const excludedDateSet = new Set(
    excludeDates.map((date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  const maxWeeksToCheck = numberOfRounds * 2;
  let weeksChecked = 0;
  let roundsScheduled = 0;

  while (roundsScheduled < numberOfRounds && weeksChecked < maxWeeksToCheck) {
    const weekDates: Date[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const dayOfWeek = date.getDay();
      const dateTime = date.getTime();

      if (validWeekDays.includes(dayOfWeek)) {
        weekDates.push(date);
      }
    }

    const hasExcludedDate = weekDates.some((date) =>
      excludedDateSet.has(date.getTime())
    );

    if (hasExcludedDate) {
      currentDate.setDate(currentDate.getDate() + 7);
      continue;
    }

    roundDates.push(weekDates);
    roundsScheduled++;
    weeksChecked++;

    currentDate.setDate(currentDate.getDate() + 7);
    currentDate.setHours(0, 0, 0, 0);
  }

  return roundDates;
}

export function generateLeagueCalendar({
  teams,
  startDate,
  excludeDates,
  validWeekDays,
  isDoubleRound,
  userId,
}: GenerateLeagueCalendarParams): Round[] {
  console.log('thinking...');
  const firstLegRounds = generateRounds(teams, userId);
  const numberOfRoundsPerLeg = firstLegRounds.length;
  let totalRounds = numberOfRoundsPerLeg;

  let allRoundsMatches: Match[][] = firstLegRounds;

  if (isDoubleRound) {
    const secondLegRounds: Match[][] = [];

    for (const round of firstLegRounds) {
      const reversedMatches = round.map((match) => ({
        home: match.away,
        away: match.home,
      }));
      secondLegRounds.push(reversedMatches);
    }

    allRoundsMatches = [...firstLegRounds, ...secondLegRounds];
    totalRounds = numberOfRoundsPerLeg * 2;
  }

  const roundDates = generateRoundDates(
    totalRounds,
    startDate,
    excludeDates,
    validWeekDays
  );

  const rounds: Round[] = [];

  for (let i = 0; i < totalRounds; i++) {
    const matches = allRoundsMatches[i];
    const dates = roundDates[i];
    const matchesPerDate = Math.ceil(matches.length / dates.length);

    const scheduledMatches: { date: Date; match: Match }[] = [];

    let matchIndex = 0;
    for (const date of dates) {
      for (let j = 0; j < matchesPerDate && matchIndex < matches.length; j++) {
        scheduledMatches.push({
          date,
          match: matches[matchIndex],
        });
        matchIndex++;
      }
    }

    rounds.push({
      dates,
      matches: scheduledMatches,
    });
  }

  return rounds;
}
