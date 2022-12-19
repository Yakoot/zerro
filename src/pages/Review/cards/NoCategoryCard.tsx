import React from 'react'
import { Typography } from '@mui/material'
import Rhythm from '@shared/ui/Rhythm'
import pluralize from '@shared/helpers/pluralize'
import { Card, TCardProps } from '../shared/Card'
import { useStats } from '../shared/getFacts'

export function NoCategoryCard(props: TCardProps) {
  const yearStats = useStats(props.year)
  const noTag = [
    ...yearStats.total.incomeTransactions.filter(tr => !tr.tag),
    ...yearStats.total.outcomeTransactions.filter(tr => !tr.tag),
  ]
  const value = noTag.length
  return (
    <Card>
      <Rhythm gap={1}>
        {value ? (
          <>
            <Typography variant="h4" align="center">
              {value} {pluralize(value, ['операция', 'операции', 'операций'])}
            </Typography>
            <Typography variant="body1" align="center">
              не {pluralize(value, ['нашла', 'нашли', 'нашли'])} свою категорию
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h4" align="center">
              👍
            </Typography>
            <Typography variant="body1" align="center">
              Круто! Ни одной операции без категории!
            </Typography>
          </>
        )}
      </Rhythm>
    </Card>
  )
}
