/**
 * Campus Connect — Shared Date & Timestamp Utilities
 * Standardized to IST (Asia/Kolkata, UTC+5:30) per institutional requirements.
 */
(function () {
  'use strict';

  window.DateUtils = {
    formatTimestamp: function (isoStr, timezone) {
      timezone = timezone || 'Asia/Kolkata';
      if (!isoStr) return '—';
      try {
        var d = new Date(isoStr);
        if (isNaN(d.getTime())) return isoStr;
        var now = new Date();
        var diffMs = now - d;
        var diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return diffMins + ' min ago';
        var diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return diffHours + ' hr' + (diffHours > 1 ? 's' : '') + ' ago';
        var diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
        return d.toLocaleString('en-IN', {
          timeZone: timezone,
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } catch (e) {
        return isoStr;
      }
    },

    formatDate: function (isoStr, timezone) {
      timezone = timezone || 'Asia/Kolkata';
      if (!isoStr) return '—';
      try {
        var d = new Date(isoStr);
        if (isNaN(d.getTime())) return isoStr;
        return d.toLocaleDateString('en-IN', {
          timeZone: timezone,
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      } catch (e) {
        return isoStr;
      }
    }
  };
})();
