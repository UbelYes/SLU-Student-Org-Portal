// Activity Tracker - Tracks user login and activity across the portal
// Include this in pages where you want to track user activity

const ActivityTracker = {
    STORAGE_KEYS: {
        ORGANIZATIONS: 'organizations',
        OSA_STAFF: 'osaStaff',
        CURRENT_USER: 'currentUser',
        USER_TYPE: 'userType'
    },

    init() {
        this.trackPageView();
        this.startActivityTracking();
    },

    trackPageView() {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            this.updateLastActivity(currentUser.id, currentUser.type);
        }
    },

    getCurrentUser() {
        const userType = localStorage.getItem(this.STORAGE_KEYS.USER_TYPE);
        const currentUser = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
        
        if (userType && currentUser) {
            return {
                type: userType,
                ...JSON.parse(currentUser)
            };
        }
        return null;
    },

    updateLastActivity(userId, userType) {
        const timestamp = new Date().toISOString();

        if (userType === 'organization') {
            this.updateOrganizationActivity(userId, timestamp);
        } else if (userType === 'osa_staff' || userType === 'admin') {
            this.updateStaffActivity(userId, timestamp);
        }
    },

    updateOrganizationActivity(orgId, timestamp) {
        const organizations = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ORGANIZATIONS) || '[]');
        const org = organizations.find(o => o.id === parseInt(orgId));
        
        if (org) {
            org.last_login = timestamp;
            localStorage.setItem(this.STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(organizations));
        }
    },

    updateStaffActivity(staffId, timestamp) {
        const staff = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.OSA_STAFF) || '[]');
        const member = staff.find(s => s.id === parseInt(staffId));
        
        if (member) {
            member.last_login = timestamp;
            localStorage.setItem(this.STORAGE_KEYS.OSA_STAFF, JSON.stringify(staff));
        }
    },

    startActivityTracking() {
        // Track activity every 2 minutes
        setInterval(() => {
            this.trackPageView();
        }, 2 * 60 * 1000);

        // Track on user interactions
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(eventType => {
            let timeout;
            document.addEventListener(eventType, () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.trackPageView();
                }, 5000); // Update after 5 seconds of inactivity
            }, { passive: true });
        });

        // Track before page unload
        window.addEventListener('beforeunload', () => {
            this.trackPageView();
        });
    },

    // Helper method to set current user (call this after login)
    setCurrentUser(userId, userType, userData) {
        localStorage.setItem(this.STORAGE_KEYS.USER_TYPE, userType);
        localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify({
            id: userId,
            ...userData
        }));
        this.updateLastActivity(userId, userType);
    },

    // Helper method to clear current user (call this on logout)
    clearCurrentUser() {
        localStorage.removeItem(this.STORAGE_KEYS.USER_TYPE);
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ActivityTracker.init());
} else {
    ActivityTracker.init();
}
