import {
  Alert,
  AlertFlagLabel,
  AlertsServiceAlert,
  getAlertFlagLabelsForAlerts,
} from '@ministryofjustice/hmpps-connect-dps-shared-items'

function isAlertsServiceAlert(alert: Alert): alert is AlertsServiceAlert {
  return typeof alert.alertCode !== 'string'
}

export const getAlertFlags = (alerts: Alert[]) => {
  const alertFlags: AlertFlagLabel[] = []

  const activeAlertCodes = alerts
    .map(alert => {
      const alertsServiceAlert = isAlertsServiceAlert(alert)
      const alertIsActive = alertsServiceAlert ? alert.isActive : alert.active && !alert.expired
      const prisonerAlertCode = alertsServiceAlert ? alert.alertCode.code : alert.alertCode

      return alertIsActive ? prisonerAlertCode : null
    })
    .filter(Boolean)

  if (activeAlertCodes.find(code => code === 'ROTL')) {
    alertFlags.push({
      alertCodes: ['ROTL'],
      classes: 'dps-alert-status dps-alert-status--risk',
      label: 'ROTL Suspension',
    })
  }

  if (activeAlertCodes.find(code => code === 'RROTL')) {
    alertFlags.push({
      alertCodes: ['ROTL'],
      classes: 'dps-alert-status dps-alert-status--risk',
      label: 'Restricted ROTL',
    })
  }

  alertFlags.push(...getAlertFlagLabelsForAlerts(alerts))
  return alertFlags
}
