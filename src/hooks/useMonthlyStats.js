import { useEffect, useState } from 'react'

const DEFAULT_MONTHLY_STATS = { monthlyRevenue: 0, orderCount: 0 }

export default function useMonthlyStats(dbRef, isAdminMode) {
  const [monthlyStats, setMonthlyStats] = useState(DEFAULT_MONTHLY_STATS)

  useEffect(() => {
    if (!dbRef || !isAdminMode) {
      setMonthlyStats(DEFAULT_MONTHLY_STATS)
      return
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const statsId = `stats_${now.getFullYear()}_${currentMonth}`

    const unsubscribeStats = dbRef
      .collection('settings')
      .doc(statsId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setMonthlyStats({ ...DEFAULT_MONTHLY_STATS, ...doc.data() })
        } else {
          setMonthlyStats(DEFAULT_MONTHLY_STATS)
        }
      })

    return () => unsubscribeStats()
  }, [dbRef, isAdminMode])

  return monthlyStats
}
