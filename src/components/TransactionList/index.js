import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Box } from '@material-ui/core'
import { useSelector } from 'react-redux'
import { getSortedTransactions } from 'store/localData/transactions'
import {
  checkRaw,
  groupTransactionsBy,
} from 'store/localData/transactions/helpers'
import { GrouppedList } from './GrouppedList'
import Filter from './TopBar/Filter'
import Actions from './TopBar/Actions'
import { sendEvent } from 'helpers/tracking'
import { getGroupedTransactions } from 'worker'
import { useDebounce } from 'helpers/useDebounce'

export default function TransactionList(props) {
  const {
    prefilter,
    filterConditions,
    hideFilter = false,
    opened,
    checkedDate,
    setOpened,
    ...rest
  } = props

  const transactions = useSelector(getSortedTransactions)
  const [filter, setFilter] = useState(filterConditions)
  const debouncedFilter = useDebounce(filter, 300)
  const setCondition = useCallback(
    condition => setFilter(filter => ({ ...filter, ...condition })),
    []
  )
  const onFilterByPayee = useCallback(payee => setFilter({ search: payee }), [])

  // const groups = useMemo(() => {
  //   if (prefilter) {
  //     return groupTransactionsBy(
  //       'DAY',
  //       transactions.filter(checkRaw(prefilter)),
  //       debouncedFilter
  //     )
  //   }
  //   return groupTransactionsBy('DAY', transactions, debouncedFilter)
  // }, [transactions, debouncedFilter, prefilter])

  const [groups, setGroups] = useState([])
  useEffect(() => {
    async function updateTransactions() {
      const t0 = performance.now()
      const gr = await getGroupedTransactions(
        'DAY',
        null, //prefilter ? transactions.filter(checkRaw(prefilter)) : transactions,
        debouncedFilter
      )
      console.log('GET groupped ', +(performance.now() - t0).toFixed(2))
      setGroups(gr)
    }
    updateTransactions()
  }, [transactions, debouncedFilter, prefilter])

  const [checked, setChecked] = useState([])

  const uncheckAll = useCallback(() => setChecked([]), [])

  const toggleTransaction = useCallback(id => {
    setChecked(current => {
      return current.includes(id)
        ? current.filter(checked => id !== checked)
        : [...current, id]
    })
  }, [])

  const checkByChangedDate = useCallback(
    date => {
      sendEvent('Transaction: select similar')
      const ids = transactions
        .filter(tr => tr.changed === +date)
        .map(tr => tr.id)
      setChecked(ids)
    },
    [transactions]
  )

  useEffect(() => {
    if (checkedDate) checkByChangedDate(checkedDate)
  }, [checkByChangedDate, checkedDate])

  const showActions = Boolean(checked?.length)

  return (
    <Box
      display="flex"
      flexDirection="column"
      px={1}
      pt={1}
      position="relative"
      {...rest}
    >
      {!hideFilter && (
        <Box
          position="relative"
          zIndex={10}
          maxWidth={560}
          width="100%"
          mx="auto"
        >
          <Filter conditions={filter} setCondition={setCondition} />
        </Box>
      )}

      <Actions
        visible={showActions}
        checkedIds={checked}
        onUncheckAll={uncheckAll}
      />

      <Box flex="1 1 auto">
        <GrouppedList
          {...{
            groups,
            opened,
            setOpened,
            checked,
            toggleTransaction,
            checkByChangedDate,
            onFilterByPayee,
          }}
        />
      </Box>
    </Box>
  )
}
