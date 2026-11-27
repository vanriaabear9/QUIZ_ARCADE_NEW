import { View } from 'react-native';

import { iconByName } from '@/components/classes';
import { PlayerIcon } from '@/components/pixel';
import { Pixel, T, Well } from '@/components/ui';
import type { LeaderRow } from '@/db/queries';
import { colors } from '@/theme';

/** Ranked rows in the Class top 5 style. The signed-in student's row is outlined in yellow. */
export function LeaderboardRows({
  rows,
  meId,
  empty = 'No scores yet this week. Finish a game to get on the board!',
}: {
  rows: LeaderRow[] | undefined;
  meId?: number;
  empty?: string;
}) {
  if (!rows) return null;
  if (rows.length === 0) {
    return (
      <Well>
        <T size={14} color={colors.muted} style={{ textAlign: 'center' }}>
          {empty}
        </T>
      </Well>
    );
  }
  return (
    <View style={{ gap: 10 }}>
      {rows.map((r) => {
        const ic = iconByName(r.icon);
        const me = r.student_id === meId;
        return (
          <Well
            key={r.student_id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 10,
              borderWidth: 2,
              borderColor: me ? colors.yellow : 'transparent',
            }}>
            <Pixel size={11} color={r.rank === 1 ? colors.yellow : colors.cyan} style={{ width: 22 }}>
              {r.rank}
            </Pixel>
            <PlayerIcon pat={ic.pat} color={ic.color} size={4} />
            <T style={{ flex: 1 }} numberOfLines={1} weight={me ? 'bold' : 'regular'}>
              {r.nickname}
              {me ? ' (you)' : ''}
            </T>
            <T weight="bold" color={colors.yellow}>
              {r.score}
            </T>
          </Well>
        );
      })}
    </View>
  );
}
