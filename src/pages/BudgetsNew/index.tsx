import React, { useCallback } from 'react'
import { useAppSelector } from 'store'
import { Redirect } from 'react-router-dom'
import { MonthInfo } from './components/MonthInfo'
import { ToBeBudgeted } from './components/ToBeBudgeted'
import { MonthSelect } from './MonthSelect'
import { Box, Drawer, Theme, useMediaQuery } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { GoalsProgressWidget } from './components/GoalsProgressWidget'
import { DnDContext } from './components/DnDContext'
import { TagPreview } from './components/TagPreview'
import { Helmet } from 'react-helmet'
import { formatDate } from 'shared/helpers/date'
import { useHotkeys } from 'react-hotkeys-hook'

import { useSearchParam } from 'shared/hooks/useSearchParam'
import { BudgetTransactionsDrawer } from './components/TransactionsDrawer'
import { nextMonth, prevMonth, toISOMonth } from 'shared/helpers/date'
import { getComputedTotals, getMonthList } from 'models/envelopes'
import { EnvelopeTable } from './components/EnvelopeTable'
import { useMonth } from './model'

export default function BudgetsRouter() {
  const [month] = useMonth()
  const monthList = useAppSelector(getMonthList)
  const minMonth = monthList[0]
  const maxMonth = monthList[monthList.length - 1]
  if (!month)
    return <Redirect to={`/budget/?month=${toISOMonth(new Date())}`} />
  if (month < minMonth) {
    return <Redirect to={`/budget/?month=${minMonth}`} />
  }
  if (month > maxMonth) {
    return <Redirect to={`/budget/?month=${maxMonth}`} />
  }
  return <Budgets />
}

const useStyles = makeStyles(theme => ({
  drawerWidth: {
    width: 360,
    [theme.breakpoints.down('sm')]: {
      width: '100vw',
    },
  },
  grid: {
    display: 'grid',
    padding: theme.spacing(3),
    gap: theme.spacing(3),
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gridTemplateAreas: `
      'month-select   goals     to-be-budgeted'
      'tags           tags      tags'
      'transfers      transfers transfers'
      'chart          chart     chart'
      'treemap        treemap   treemap'
    `,
    width: '100%',
    maxWidth: 800,
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(1, 1, 10),
    },
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(2),
      padding: theme.spacing(1, 1, 10),
      gridTemplateColumns: '1fr',
      gridTemplateAreas: `'month-select' 'goals' 'to-be-budgeted' 'tags' 'transfers' 'treemap'`,
    },
  },
  monthSelect: { gridArea: 'month-select' },
  goals: { gridArea: 'goals' },
  toBeBudgeted: { gridArea: 'to-be-budgeted' },
  tags: { gridArea: 'tags' },
  transfers: { gridArea: 'transfers' },
  chart: { gridArea: 'chart' },
  treemap: { gridArea: 'treemap' },
}))

function Budgets() {
  const monthList = useAppSelector(getMonthList)
  const minMonth = monthList[0]
  const maxMonth = monthList[monthList.length - 1]
  const [month, setMonth] = useMonth()

  const envBudgets = useAppSelector(getComputedTotals)[month]

  const [drawerId, setDrawerId] = useSearchParam('drawer')
  const isMD = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'))
  const c = useStyles()
  const drawerVisibility = !isMD || !!drawerId

  useHotkeys(
    'left',
    () => {
      const prevMonthISO = toISOMonth(prevMonth(month))
      if (minMonth <= prevMonthISO) setMonth(prevMonthISO)
    },
    [month, minMonth]
  )
  useHotkeys(
    'right',
    () => {
      const nextMonthISO = toISOMonth(nextMonth(month))
      if (nextMonthISO <= maxMonth) setMonth(nextMonthISO)
    },
    [month, maxMonth]
  )

  const openOverview = useCallback(() => setDrawerId('overview'), [setDrawerId])
  const openTagInfo = useCallback(
    (id: string | null | undefined) => setDrawerId(id),
    [setDrawerId]
  )
  const closeDrawer = useCallback(() => setDrawerId(), [setDrawerId])

  return (
    <>
      <Helmet>
        <title>Бюджет на {formatDate(month, 'LLLL yyyy')} | Zerro</title>
        <meta name="description" content="" />
        <link rel="canonical" href="https://zerro.app/budget" />
      </Helmet>

      <DnDContext>
        <Box display="flex" justifyContent="center" position="relative">
          <Box className={c.grid}>
            <MonthSelect
              className={c.monthSelect}
              onChange={setMonth}
              {...{ minMonth, maxMonth, value: month }}
            />
            <GoalsProgressWidget className={c.goals} />
            <ToBeBudgeted className={c.toBeBudgeted} onClick={openOverview} />
            <EnvelopeTable
              className={c.tags}
              openDetails={openTagInfo}
              onOpenMonthDrawer={openOverview}
            />
            {/* <TagTable
              className={c.tags}
              openDetails={openTagInfo}
              onOpenMonthDrawer={openOverview}
            /> */}
          </Box>

          <Drawer
            classes={{ paper: c.drawerWidth, root: c.drawerWidth }}
            variant={isMD ? 'temporary' : 'persistent'}
            anchor="right"
            open={drawerVisibility}
            onClose={closeDrawer}
          >
            {(!drawerId || drawerId === 'overview') && (
              <MonthInfo onClose={closeDrawer} />
            )}
            {drawerId && <TagPreview onClose={closeDrawer} id={drawerId} />}
          </Drawer>

          <BudgetTransactionsDrawer />
        </Box>
      </DnDContext>
    </>
  )
}
