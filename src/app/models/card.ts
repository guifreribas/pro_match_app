export type CardType = 'YELLOW' | 'RED' | 'BLUE';
export type CardPart =
  | 'FIRST_HALF'
  | 'SECOND_HALF'
  | 'EXTRA_TIME_FIRST_HALF'
  | 'EXTRA_TIME_SECOND_HALF'
  | 'PENALTIES';

export interface Card {
  id_card?: number;
  card_type: CardType;
  minute: number;
  part: CardPart;
  match_id: number;
  player_id: number;
  team_id: number;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}
