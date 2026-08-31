import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useAuth } from '../context/AuthContext';

// Frontend-only idle timeout, independent of the 15-min access token / 7-day
// refresh token: this app handles salary and bank data, and the existing
// silent-refresh flow otherwise keeps a forgotten tab "logged in" for up to
// 7 days. Mounted only inside AppLayout, which only renders for an already
// authenticated session (see App.js's ProtectedRoute), so this never runs
// on the login page itself.
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_BEFORE_MS = 60 * 1000;
const ACTIVITY_THROTTLE_MS = 5 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
// The refresh token is an httpOnly cookie, which every tab of this origin
// shares - so without this, one idle tab logging out would revoke the session
// server-side out from under a *different* tab the user is actively working
// in. Broadcasting activity through a localStorage key lets every tab's timer
// reset whenever any tab sees real activity, the same way a proper single
// sign-out would. Only a timestamp goes through this key; no credential has
// been in web storage since the move to cookie-based sessions.
const ACTIVITY_BROADCAST_KEY = 'accusharp.lastActivity';

export default function IdleSessionGuard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(null);
  const warningShowingRef = useRef(false);
  const lastResetRef = useRef(Date.now());
  const warnTimer = useRef(null);
  const logoutTimer = useRef(null);
  const countdownInterval = useRef(null);

  const clearTimers = () => {
    clearTimeout(warnTimer.current);
    clearTimeout(logoutTimer.current);
    clearInterval(countdownInterval.current);
  };

  const handleLogout = useCallback(() => {
    clearTimers();
    logout().finally(() => navigate('/login', { replace: true }));
  }, [logout, navigate]);

  const startWarning = useCallback(() => {
    warningShowingRef.current = true;
    setSecondsLeft(Math.round(WARNING_BEFORE_MS / 1000));
    countdownInterval.current = setInterval(() => {
      setSecondsLeft((s) => (s !== null && s > 0 ? s - 1 : s));
    }, 1000);
    logoutTimer.current = setTimeout(handleLogout, WARNING_BEFORE_MS);
  }, [handleLogout]);

  // broadcast: true means "tell other tabs I'm active"; false is used when
  // *this* reset was itself triggered by another tab's broadcast, so we
  // don't need to write straight back to the key we just read.
  const resetTimers = useCallback((broadcast = true) => {
    clearTimers();
    warningShowingRef.current = false;
    lastResetRef.current = Date.now();
    setSecondsLeft(null);
    warnTimer.current = setTimeout(startWarning, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);
    if (broadcast) {
      try {
        localStorage.setItem(ACTIVITY_BROADCAST_KEY, String(Date.now()));
      } catch {
        // Storage can throw in private-browsing/quota-exceeded edge cases -
        // cross-tab sync is a nice-to-have, not worth failing the reset over.
      }
    }
  }, [startWarning]);

  useEffect(() => {
    resetTimers();
    const onActivity = () => {
      // While the warning dialog is up, only its own buttons should count -
      // otherwise a stray mousemove while reading the warning would dismiss
      // it silently, defeating the point of asking.
      if (warningShowingRef.current) return;
      if (Date.now() - lastResetRef.current < ACTIVITY_THROTTLE_MS) return;
      resetTimers();
    };
    // A real signal from another tab always counts, even while this tab's
    // own warning is showing - if the user is genuinely active elsewhere,
    // this tab shouldn't sign them out either.
    const onCrossTabActivity = (e) => {
      if (e.key !== ACTIVITY_BROADCAST_KEY) return;
      resetTimers(false);
    };
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }));
    window.addEventListener('storage', onCrossTabActivity);
    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity));
      window.removeEventListener('storage', onCrossTabActivity);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open={secondsLeft !== null} maxWidth="xs" fullWidth data-testid="idle-timeout-dialog">
      <DialogTitle>Still there?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You&apos;ve been inactive for a while. For your security, you&apos;ll be signed out in{' '}
          {secondsLeft} second{secondsLeft === 1 ? '' : 's'} unless you stay signed in.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={handleLogout}>
          Sign out now
        </Button>
        <Button variant="contained" onClick={() => resetTimers()} autoFocus>
          Stay signed in
        </Button>
      </DialogActions>
    </Dialog>
  );
}
