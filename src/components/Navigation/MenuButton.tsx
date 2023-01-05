import React, { FC, useState } from 'react'
import { useAppDispatch } from '@store'
import { logOut } from '@features/authorization'
import { exportCSV } from '@features/export/exportCSV'
import { exportJSON } from '@features/export/exportJSON'
import { makeStyles } from '@mui/styles'
import {
  SettingsIcon,
  SaveAltIcon,
  ExitToAppIcon,
  WhatshotIcon,
  WbSunnyIcon,
  NightsStayIcon,
  FavoriteBorderIcon,
  HelpOutlineIcon,
  BarChartIcon,
  SyncIcon,
  SyncDisabledIcon,
  AutoAwesomeIcon,
} from '@shared/ui/Icons'
import { Link } from 'react-router-dom'
import {
  Box,
  Divider,
  IconButton,
  IconButtonProps,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  Typography,
} from '@mui/material'
import { Tooltip } from '@shared/ui/Tooltip'
import { useThemeType } from '@shared/hooks/useThemeType'
import { sendEvent } from '@shared/helpers/tracking'
import { resetData } from '@store/data'
import { clearLocalData } from '@features/localData'
import { Confirm } from '@shared/ui/Confirm'
import { useRegularSync } from '@components/RegularSyncHandler'
import { appVersion } from '@shared/config'
import { userSettingsModel } from '@entities/userSettings'

const useStyles = makeStyles(({ spacing }) => ({
  menuIcon: { marginRight: spacing(1) },
}))
type SettingsMenuProps = {
  showLinks?: boolean
  anchorEl: Element | null
  onClose: () => void
}
export const SettingsMenu: FC<SettingsMenuProps> = props => {
  const { anchorEl, onClose, showLinks } = props
  const dispatch = useAppDispatch()
  const classes = useStyles()
  const [regular, setRegular] = useRegularSync()
  const useZmBudgets = userSettingsModel.useUserSettings()['useZmBudgets']
  // const patchSettings = userSettingsModel.patchUserSettings()
  const toggleUseZmBudgets = () =>
    dispatch(
      userSettingsModel.patchUserSettings({ useZmBudgets: !useZmBudgets })
    )
  const theme = useThemeType()
  const handleThemeChange = () => {
    sendEvent('Settings: toggle theme')
    onClose()
    theme.toggle()
  }
  const handleExportCSV = () => {
    sendEvent('Settings: export csv')
    dispatch(exportCSV)
  }
  const handleExportJSON = () => {
    sendEvent('Settings: export json')
    dispatch(exportJSON)
  }
  const handleLogOut = () => {
    sendEvent('Settings: log out')
    dispatch(logOut())
  }
  const reloadData = () => {
    sendEvent('Settings: reload data')
    dispatch(resetData())
    dispatch(clearLocalData())
    window.location.reload()
  }
  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      <MenuItem onClick={handleExportCSV}>
        <SaveAltIcon className={classes.menuIcon} color="action" />
        Скачать CSV
      </MenuItem>
      <MenuItem onClick={handleExportJSON}>
        <SaveAltIcon className={classes.menuIcon} color="action" />
        Полный бэкап
      </MenuItem>
      <Box my={1}>
        <Divider light />
      </Box>
      <MenuItem onClick={handleThemeChange}>
        {theme.type === 'dark' ? (
          <>
            <WbSunnyIcon className={classes.menuIcon} color="action" />
            Светлая тема
          </>
        ) : (
          <>
            <NightsStayIcon className={classes.menuIcon} color="action" />
            Тёмная тема
          </>
        )}
      </MenuItem>
      <Box my={1}>
        <Divider light />
      </Box>
      <MenuItem component={Link} to="/stats" key="/stats">
        <BarChartIcon className={classes.menuIcon} color="action" />
        Статистика (beta 😬)
      </MenuItem>

      {showLinks && [
        <MenuItem component={Link} to="/about" key="/about">
          <HelpOutlineIcon className={classes.menuIcon} color="action" />
          Как пользоваться
        </MenuItem>,
        <MenuItem component={Link} to="/donation" key="/donation">
          <FavoriteBorderIcon className={classes.menuIcon} color="action" />
          Поддержать проект
        </MenuItem>,
        <MenuItem component={Link} to="/review" key="/review">
          <WhatshotIcon className={classes.menuIcon} color="action" />
          Итоги года
        </MenuItem>,
      ]}
      <Box my={1}>
        <Divider light />
      </Box>
      <Confirm onOk={reloadData}>
        <MenuItem>
          <SyncIcon className={classes.menuIcon} color="action" />
          Перезагрузить данные
        </MenuItem>
      </Confirm>
      <MenuItem onClick={() => setRegular(c => !c)}>
        {regular ? (
          <SyncIcon className={classes.menuIcon} color="action" />
        ) : (
          <SyncDisabledIcon className={classes.menuIcon} color="action" />
        )}
        <ListItemText>Автосинхронизация</ListItemText>
        <Switch edge="end" checked={regular} />
      </MenuItem>
      <MenuItem onClick={toggleUseZmBudgets}>
        <AutoAwesomeIcon className={classes.menuIcon} color="action" />
        <ListItemText
          sx={{ whiteSpace: 'normal' }}
          primary={'Бюджеты Дзен-мани'}
          secondary={'Использовать те же бюджеты что и ДМ'}
        />
        <Switch edge="end" checked={!!useZmBudgets} />
      </MenuItem>
      <Box my={1}>
        <Divider light />
      </Box>
      <MenuItem onClick={handleLogOut}>
        <ExitToAppIcon className={classes.menuIcon} color="action" />
        Выйти
      </MenuItem>
      <Box pl={6} pr={2} py={0.5}>
        <Typography
          variant="overline"
          color="textSecondary"
          align="center"
          onClick={() => window.location.reload()}
        >
          {appVersion}
        </Typography>
      </Box>
    </Menu>
  )
}

interface MenuButtonProps extends IconButtonProps {
  showLinks?: boolean
}

export const MenuButton: FC<MenuButtonProps> = ({ showLinks, ...rest }) => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)
  const handleClose = () => setAnchorEl(null)
  return (
    <>
      <Tooltip title="Настройки">
        <IconButton onClick={e => setAnchorEl(e.currentTarget)} {...rest}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <SettingsMenu
        anchorEl={anchorEl}
        onClose={handleClose}
        showLinks={showLinks}
      />
    </>
  )
}
