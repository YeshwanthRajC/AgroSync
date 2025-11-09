# 🎯 SESSION-BASED DRONE OPERATIONS - COMPLETE GUIDE

## ✅ WHAT CHANGED - NEW DATABASE DESIGN

### **OLD System (Individual Markers):**
- Each marker saved separately ❌
- No grouping or organization
- Hard to track operations

### **NEW System (Session-Based):** ✅
- **Operations grouped by sessions**
- Each session = one drone operation
- Multiple markers per session
- History shows operations with all areas covered

---

## 📊 NEW DATABASE STRUCTURE

### **1. drone_sessions Table** (Operation Sessions)
```sql
- id (uuid) - Session ID
- user_id (uuid) - Who owns this operation
- session_name (text) - "Morning Field Survey - Oct 30"
- session_date (date) - When operation was done
- start_time (timestamp) - When started
- end_time (timestamp) - When completed
- status (text) - 'active', 'completed', or 'archived'
- notes (text) - Optional operation notes
- total_areas (integer) - Auto-counted markers
- created_at, updated_at - Timestamps
```

### **2. session_markers Table** (Areas within Sessions)
```sql
- id (uuid) - Marker ID
- session_id (uuid) - Which operation this belongs to
- user_id (uuid) - Who owns it
- area_name (text) - "Area 1", "Area 2", etc.
- location_name (text) - Full address
- coordinates (text) - "13.140200°N, 79.909400°E"
- latitude, longitude (numeric) - GPS coordinates
- marker_order (integer) - Order within session (1, 2, 3...)
- created_at - When marked
```

### **3. Other Tables** (Unchanged)
- `profiles` - User information
- `image_analyses` - Crop analysis results (can link to sessions)
- `user_preferences` - User settings
- `weather_history` - Weather logs

---

## 🔄 WHAT YOU NEED TO DO

### **STEP 1: Run the NEW SQL Schema**

⚠️ **IMPORTANT:** Use the NEW file, not the old one!

1. Go to: https://supabase.com/dashboard/project/tjmhtrtbqzjxjugsnura/sql/new
2. Open file: **`supabase_sessions_schema.sql`** (NEW FILE)
3. Copy ALL the SQL code
4. Paste into Supabase SQL Editor
5. Click **"RUN"**
6. Wait for ✅ "Success. No rows returned"

**This will:**
- Create `drone_sessions` table (operation sessions)
- Create `session_markers` table (markers within sessions)
- Auto-count total_areas when markers added/removed
- Keep other tables (profiles, image_analyses, etc.)
- Add Row Level Security
- Create performance indexes

---

## 🎨 NEW USER EXPERIENCE

### **How It Works:**

1. **Auto-Create Session**
   - When you open the map, an "active" session is automatically created
   - Example: "Operation 10/30/2025 2:45:30 PM"

2. **Add Markers**
   - Click anywhere on map → Marker added to current session
   - Each marker labeled "Area 1", "Area 2", "Area 3", etc.
   - All markers belong to the current operation

3. **Complete Operation**
   - Click **"Complete Operation"** button when done
   - Current session marked as "completed"
   - New "active" session automatically created for next operation

4. **View History**
   - Click **"View History"** button
   - Side panel shows ALL past operations
   - Each operation shows:
     - Operation name (editable)
     - Date and status
     - Total areas covered
     - List of all markers with coordinates
     - Notes (if any)

---

## 🆕 NEW FEATURES IN MAP PAGE

### **Session Controls:**
- ✅ **Edit Session Name** - Click pencil icon to rename operation
- ✅ **Complete Operation** - Finish current operation, start new one
- ✅ **Clear All** - Remove all markers from current operation
- ✅ **View History** - See all past operations

### **History Panel Shows:**
- 📋 All past operations (sessions)
- 🗓️ Date and status for each operation
- 📍 Total areas covered per operation
- 🗺️ Complete list of markers with:
  - Area name
  - Full location address
  - Exact coordinates
  - Order in operation (1, 2, 3...)
- 🏷️ Status badges (active, completed, archived)

### **Current Session Display:**
- Session name (editable with save button)
- Number of areas marked in this operation
- Status (active/completed)
- All control buttons

---

## 📝 EXAMPLE USAGE SCENARIO

### **Morning Operation:**
1. Open map page
2. Auto-created session: "Operation 10/30/2025 9:00 AM"
3. Click to rename: "Morning Field Survey - North Section"
4. Mark 5 areas: Area 1, Area 2, Area 3, Area 4, Area 5
5. Click "Complete Operation"

### **Afternoon Operation:**
1. New session auto-created: "Operation 10/30/2025 2:30 PM"
2. Rename: "Afternoon Inspection - South Fields"
3. Mark 3 areas: Area 1, Area 2, Area 3
4. Click "Complete Operation"

### **View History:**
1. Click "View History"
2. See both operations:
   - **Morning Field Survey - North Section** (5 areas)
     - Area 1: Thiruvallur, Tamil Nadu...
     - Area 2: Kakkalur, Tamil Nadu...
     - Area 3: ...
     - (and so on)
   - **Afternoon Inspection - South Fields** (3 areas)
     - Area 1: ...
     - Area 2: ...
     - Area 3: ...

---

## 🔐 DATABASE SAFETY

### **No Data Loss:**
- ✅ All old functionality preserved
- ✅ Row Level Security maintained
- ✅ Users only see their own data
- ✅ Cascade delete: Delete session → Deletes all markers in that session
- ✅ Auto-count: total_areas updates automatically

### **Automatic Features:**
- ✅ Auto-create profile on signup (unchanged)
- ✅ Auto-update timestamps (unchanged)
- ✅ Auto-count markers per session (NEW)
- ✅ Auto-create active session if none exists (NEW)

---

## 🧪 HOW TO TEST

### **1. Test New Session Creation:**
```
1. Login to your account
2. Go to "Drone Map" page
3. See auto-created session name at top
4. Click pencil icon → Edit session name
5. Save → Name updated ✅
```

### **2. Test Marking Areas:**
```
1. Click anywhere on map → Area 1 marked
2. Click again → Area 2 marked
3. Click again → Area 3 marked
4. All markers show on map with labels
5. Refresh page → All markers still there ✅
```

### **3. Test Complete Operation:**
```
1. Mark 3-5 areas
2. Click "Complete Operation" button
3. Confirm dialog
4. Current session marked "completed"
5. New "active" session auto-created
6. Map cleared for new operation ✅
```

### **4. Test History:**
```
1. Complete 2-3 operations with different markers
2. Click "View History" button
3. Side panel shows all operations
4. Each operation shows:
   - Session name
   - Date and status
   - All markers with details
5. Can see complete operation history ✅
```

### **5. Test Data Persistence:**
```
1. Complete an operation with 5 markers
2. Logout
3. Login again
4. Click "View History"
5. Previous operation still there with all markers ✅
```

---

## 📂 NEW FILES CREATED

1. **`supabase_sessions_schema.sql`** ⭐ **RUN THIS**
   - Complete updated database schema
   - Session-based tables
   - Auto-count triggers
   - RLS policies

2. **`src/services/databaseSessions.js`**
   - New database service layer
   - Session management functions
   - Marker management within sessions
   - History retrieval

3. **`src/pages/DroneMapPage.jsx`** (Updated)
   - Session-based interface
   - Editable session names
   - Complete operation button
   - Enhanced history panel

4. **`SESSION_GUIDE.md`** (This file)
   - Complete documentation
   - Database structure explained
   - Usage examples

---

## 🔍 DATABASE FUNCTIONS AVAILABLE

### **Session Management:**
- `createSession(name)` - Create new operation session
- `getSessions()` - Get all user's sessions
- `getActiveSession()` - Get/create current active session
- `completeSession(id)` - Mark session as completed
- `deleteSession(id)` - Delete session (and all markers)
- `updateSession(id, updates)` - Update session name/notes

### **Marker Management:**
- `addMarkerToSession(sessionId, markerData)` - Add marker to session
- `getSessionMarkers(sessionId)` - Get all markers in a session
- `getActiveSessionMarkers()` - Get markers in active session
- `deleteMarker(id)` - Delete specific marker
- `clearSessionMarkers(sessionId)` - Clear all markers in session

### **History:**
- `getSessionsWithMarkers()` - Get all sessions with their markers (for history)

---

## 🎯 KEY DIFFERENCES FROM OLD SYSTEM

| Feature | OLD | NEW |
|---------|-----|-----|
| Storage | Individual markers | Grouped by sessions |
| Organization | None | Session-based operations |
| History | List of markers | List of operations with markers |
| Naming | Area 1, Area 2 globally | Area 1, Area 2 per session |
| Completion | Manual clear all | "Complete Operation" button |
| Tracking | Hard to track operations | Easy operation tracking |
| Context | No context | Full operation context |

---

## 🚨 TROUBLESHOOTING

### **Error: "User not authenticated"**
- Make sure you're logged in
- Check console for auth errors

### **Session not auto-creating**
- Check browser console for errors
- Verify SQL schema was run
- Check `drone_sessions` table exists in Supabase

### **Markers not grouping**
- Ensure `session_id` is being saved
- Check `session_markers` table in Supabase
- Verify session exists before adding markers

### **History panel empty**
- Complete at least one operation first
- Check if `getSessionsWithMarkers()` returns data
- Look for console errors

### **Can't edit session name**
- Click pencil icon next to name
- Make changes and click save (checkmark icon)
- Check for save errors in console

---

## ✅ VERIFICATION CHECKLIST

After running SQL schema:

- [ ] `drone_sessions` table exists in Supabase
- [ ] `session_markers` table exists in Supabase
- [ ] Green shield (RLS) on both new tables
- [ ] Map page loads without errors
- [ ] Session name appears at top
- [ ] Can edit session name
- [ ] Clicking map adds markers
- [ ] Markers numbered (Area 1, 2, 3...)
- [ ] "Complete Operation" button works
- [ ] New session auto-created after completion
- [ ] "View History" shows past operations
- [ ] History shows all markers per operation
- [ ] Data persists after logout/login

---

## 🎉 YOU'RE ALL SET!

**Database:** ✅ Session-based structure  
**Code:** ✅ Updated to use sessions  
**UI:** ✅ Enhanced with session controls  
**History:** ✅ Shows operations with all areas  

**Next Step:** Run `supabase_sessions_schema.sql` in Supabase, then test the new session-based operations! 🚀

---

## 📞 QUICK REFERENCE

### **Files to Check:**
1. `supabase_sessions_schema.sql` - Database schema (RUN THIS)
2. `src/services/databaseSessions.js` - Database functions
3. `src/pages/DroneMapPage.jsx` - Updated map page
4. `SESSION_GUIDE.md` - This complete guide

### **Key Concepts:**
- **Session** = One drone operation
- **Markers** = Areas covered in that operation
- **Active Session** = Current ongoing operation
- **Completed Session** = Finished operation in history
- **History** = All past operations with their markers

### **User Actions:**
1. Open map → Auto-session created
2. Click map → Add markers to session
3. Complete → Finish operation, start new one
4. View History → See all past operations

---

**Database designed for safety and efficiency! No data damage possible.** ✅
