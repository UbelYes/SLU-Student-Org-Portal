// Activity Tracker - Tracks user login and activity across the portal (SQL-based)
// Include this in pages where you want to track user activity

const ActivityTracker = {
    init() {
        this.trackPageView();
        this.startActivityTracking();
    },

    trackPageView() {
        this.updateLastActivity();
    },

    async updateLastActivity() {
        try {
            const response = await fetch('../api/update-activity.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('Activity updated:', data.timestamp);
                }
            }
        } catch (error) {
            console.error('Failed to update activity:', error);
        }
    },

    startActivityTracking() {
        // Track activity every 2 minutes
        setInterval(() => {
            this.updateLastActivity();
        }, 2 * 60 * 1000);

        // Track on user interactions (throttled)
        let timeout;
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.updateLastActivity();
                }, 30000); // Update after 30 seconds of last interaction
            }, { passive: true, once: false });
        });

        // Track before page unload
        window.addEventListener('beforeunload', () => {
            // Use sendBeacon for more reliable tracking on page unload
            const blob = new Blob([JSON.stringify({})], { type: 'application/json' });
            navigator.sendBeacon('../api/update-activity.php', blob);
        });
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ActivityTracker.init());
} else {
    ActivityTracker.init();
}
