"""
Generate high-fidelity PNG diagrams and wireframes for Assignment 6 and 7:
1. Design-Class-Diagram.png
2. Architectural-Diagram.png
3. Component-Design-Diagram.png
4. UI-Wireframe-01.png (Login Screen S1)
5. UI-Wireframe-02.png (Event Creation S2)
6. UI-Wireframe-03.png (Event Details & Registration S3)
7. UI-Wireframe-04.png (Event Approval Review S4)
"""

import os
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIAG_DIR = os.path.join(BASE_DIR, 'docs', 'design', 'assignment-06', 'diagrams')
UI_DIR = os.path.join(DIAG_DIR, 'interfaces')
os.makedirs(DIAG_DIR, exist_ok=True)
os.makedirs(UI_DIR, exist_ok=True)

# Helper function to create base canvas
def create_canvas(width, height, bg_color=(248, 250, 252)):
    return Image.new('RGB', (width, height), bg_color)

def draw_header(draw, title, subtitle, width, bg=(30, 27, 75)):
    draw.rectangle([0, 0, width, 70], fill=bg)
    draw.text((25, 14), title, fill=(255, 255, 255))
    draw.text((25, 40), subtitle, fill=(196, 181, 253))

def draw_card(draw, x, y, w, h, title, subtitle=None, bg=(255, 255, 255), border=(203, 213, 225)):
    draw.rectangle([x, y, x + w, y + h], fill=bg, outline=border, width=2)
    if title:
        draw.rectangle([x, y, x + w, y + 28], fill=(241, 245, 249), outline=border, width=1)
        draw.text((x + 10, y + 7), title, fill=(15, 23, 42))
    if subtitle:
        draw.text((x + 10, y + 34), subtitle, fill=(100, 116, 139))

# ============================================================================
# 1. Design-Class-Diagram.png
# ============================================================================
def generate_class_diagram():
    w, h = 1400, 950
    img = create_canvas(w, h)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "InstituteConnect — Detailed Design Class Diagram (UML 2.5)", 
                "Lab Assignment 6 · Software Engineering & Design Specification · Team T005, LNMIIT", w)

    # User hierarchy
    # Base User
    draw_card(draw, 50, 100, 360, 200, "User (Abstract Base)")
    user_attrs = [
        "- userId: String",
        "- name: String",
        "- email: String",
        "- phone: String",
        "- role: UserRole",
        "- accountStatus: AccountStatus",
        "+ authenticate(email, pass): Boolean",
        "+ logout(): Void",
        "+ hasRole(role): Boolean"
    ]
    for i, line in enumerate(user_attrs):
        draw.text((60, 135 + i * 17), line, fill=(51, 65, 85))

    # User subclasses
    subclasses = [
        ("ProspectiveStudent", ["- level: String", "+ browseEvents(): Event[]", "+ registerForEvent(id): Reg", "+ cancelRegistration(id)"], 50, 340, 240, 110),
        ("InstitutionContact", ["- institutionId: String", "+ viewRelevantEvents()", "+ confirmParticipation()", "+ viewHistory()"], 310, 340, 240, 110),
        ("OutreachCoordinator", ["+ createEvent(details, act)", "+ saveDraft(id, details)", "+ submitForApproval(id)", "+ updateEvent(id, details)"], 50, 480, 240, 110),
        ("OutreachApprover", ["+ viewPendingEvents()", "+ approveEvent(id, comments)", "+ rejectEvent(id, reason)", "+ viewApprovalHistory(id)"], 310, 480, 240, 110),
        ("Administrator", ["+ manageUsers()", "+ assignRoles(target, role)", "+ manageConfiguration()"], 50, 620, 240, 95),
        ("InstituteManagement", ["+ viewReports(): Report", "+ viewDashboards(): Metrics"], 310, 620, 240, 95)
    ]
    for name, ops, x, y, cw, ch in subclasses:
        draw_card(draw, x, y, cw, ch, name)
        for idx, op in enumerate(ops):
            draw.text((x + 8, y + 33 + idx * 16), op, fill=(51, 65, 85))

    # Institution and Contact
    draw_card(draw, 600, 100, 360, 180, "Institution")
    inst_lines = [
        "- institutionId: String",
        "- name: String",
        "- type: InstitutionType",
        "- region: String",
        "- relationshipStatus: String",
        "- primaryContactId: String",
        "+ getDetails(): Institution",
        "+ updateDetails(values): Boolean",
        "+ getContacts(): Contact[]"
    ]
    for i, l in enumerate(inst_lines):
        draw.text((610, 135 + i * 16), l, fill=(51, 65, 85))

    draw_card(draw, 600, 320, 360, 160, "Contact")
    contact_lines = [
        "- contactId: String",
        "- institutionId: String",
        "- name: String",
        "- designation: String",
        "- email: String",
        "- phone: String",
        "+ updateDetails(values): Boolean",
        "+ getInstitution(): Institution"
    ]
    for i, l in enumerate(contact_lines):
        draw.text((610, 355 + i * 16), l, fill=(51, 65, 85))

    # OutreachEvent
    draw_card(draw, 1000, 100, 360, 300, "OutreachEvent")
    event_lines = [
        "- eventId: String",
        "- title: String",
        "- description: String",
        "- category: String",
        "- date: Date",
        "- startTime: Time",
        "- endTime: Time",
        "- mode: EventMode",
        "- venue: String",
        "- capacity: Integer",
        "- registrationStart: Date",
        "- registrationEnd: Date",
        "- eligibilityCriteria: String",
        "- status: EventStatus",
        "- organizerId: String",
        "+ validateDetails(): ValidationResult",
        "+ isRegistrationOpen(now): Boolean",
        "+ hasCapacity(count): Boolean"
    ]
    for i, l in enumerate(event_lines):
        draw.text((1010, 135 + i * 15), l, fill=(51, 65, 85))

    # Registration & Approval & Notification
    draw_card(draw, 1000, 430, 360, 150, "Registration")
    reg_lines = [
        "- registrationId: String",
        "- userId: String",
        "- eventId: String",
        "- registrationDate: DateTime",
        "- status: RegistrationStatus",
        "+ validateEligibility(user, event)",
        "+ confirm(): Boolean",
        "+ cancel(): Boolean"
    ]
    for i, l in enumerate(reg_lines):
        draw.text((1010, 465 + i * 15), l, fill=(51, 65, 85))

    draw_card(draw, 1000, 610, 360, 140, "Approval")
    app_lines = [
        "- approvalId: String",
        "- eventId: String",
        "- approverId: String",
        "- decision: ApprovalDecision",
        "- comments: String",
        "- decisionDate: DateTime",
        "+ validateDecision(): ValidationResult"
    ]
    for i, l in enumerate(app_lines):
        draw.text((1010, 645 + i * 15), l, fill=(51, 65, 85))

    draw_card(draw, 600, 520, 360, 140, "Notification")
    notif_lines = [
        "- notificationId: String",
        "- userId: String",
        "- message: String",
        "- notificationType: String",
        "- createdAt: DateTime",
        "- status: NotificationStatus",
        "+ markAsRead(): Boolean",
        "+ dispatch(): Boolean"
    ]
    for i, l in enumerate(notif_lines):
        draw.text((610, 555 + i * 15), l, fill=(51, 65, 85))

    # Enumerations Box
    draw_card(draw, 50, 750, 1310, 160, "Enumerations (System Defined Types)", bg=(241, 245, 249))
    enums = [
        "UserRole: Student, Institution contact, Coordinator, Approver, Administrator, Management",
        "AccountStatus: Active, Inactive, Suspended",
        "EventStatus: Draft, Pending (Submitted), Under Review, Approved, Rejected, Published, Cancelled, Completed",
        "RegistrationStatus: Confirmed / Registered, Pending, Rejected, Cancelled, Event cancelled",
        "ApprovalDecision: Approved, Rejected, Under Review",
        "EventMode: Offline, Online, Hybrid  |  InstitutionType: School, College, Other  |  NotificationStatus: Unread, Read, Sent"
    ]
    for i, e in enumerate(enums):
        draw.text((65, 785 + i * 20), "•  " + e, fill=(30, 41, 59))

    img.save(os.path.join(DIAG_DIR, 'Design-Class-Diagram.png'))
    print("Generated Design-Class-Diagram.png")

# ============================================================================
# 2. Architectural-Diagram.png
# ============================================================================
def generate_architectural_diagram():
    w, h = 1300, 850
    img = create_canvas(w, h)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "InstituteConnect — 5-Layer Architectural Design (IEEE 1471 / ISO 42010)",
                "System Layers, Boundaries, Data Flows & Communication Protocols · Team T005, LNMIIT", w)

    layers = [
        ("Layer 1: Presentation Layer (Next.js & React UI Client)",
         [("Student Portal (S1, S3)", 50, 130, 360, 80),
          ("Coordinator Portal (S2)", 470, 130, 360, 80),
          ("Approver & Admin Portal (S4)", 890, 130, 360, 80)], 90, 140),
        ("Layer 2: API & Controller Gateway Layer (Route Handlers & Neon Auth)",
         [("/api/auth/[...path] (Auth & Sessions)", 50, 270, 360, 80),
          ("/api/workspace (RPC Action Dispatcher)", 470, 270, 360, 80),
          ("/api/health & Session Middleware", 890, 270, 360, 80)], 230, 140),
        ("Layer 3: Core Domain & Business Service Layer",
         [("EventService & Lifecycle Engine", 50, 410, 270, 80),
          ("RegistrationService & Eligibility", 350, 410, 270, 80),
          ("ApprovalService & Decision Queue", 650, 410, 270, 80),
          ("NotificationService & Reminders", 950, 410, 300, 80)], 370, 140),
        ("Layer 4: Data Access & Repository Layer",
         [("WorkspaceRepository (Persistence Manager)", 120, 550, 480, 80),
          ("Generic Repository<T> & Query Builders", 700, 550, 480, 80)], 510, 140),
        ("Layer 5: Enterprise Database Layer (PostgreSQL / Neon Shared DB)",
         [("PostgreSQL Shared DB (Events, Registrations, Institutions, Audits, Triggers)", 150, 690, 1000, 80)], 650, 140)
    ]

    for title, cards, ly, lh in layers:
        draw.rectangle([30, ly, w - 30, ly + lh], fill=(241, 245, 249), outline=(203, 213, 225), width=2)
        draw.text((45, ly + 8), title, fill=(30, 41, 59))
        for cname, cx, cy, cw, ch in cards:
            draw_card(draw, cx, cy, cw, ch, cname, bg=(255, 255, 255))

    # Flow arrows (downward indicators)
    for y_pos in [230, 370, 510, 650]:
        draw.line([w // 2, y_pos - 10, w // 2, y_pos + 5], fill=(99, 102, 241), width=4)

    img.save(os.path.join(DIAG_DIR, 'Architectural-Diagram.png'))
    print("Generated Architectural-Diagram.png")

# ============================================================================
# 3. Component-Design-Diagram.png
# ============================================================================
def generate_component_diagram():
    w, h = 1300, 800
    img = create_canvas(w, h)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "InstituteConnect — Component-Level Design Diagram (UML 2.5)",
                "Component Interfaces, Dependencies, Realizations & Connectors · Team T005, LNMIIT", w)

    components = [
        ("<<component>>\nAuthComponent", ["Provides: IAuthService", "Requires: INeonAuthAPI", "Handles: sessions, cookies"], 50, 120, 350, 140),
        ("<<component>>\nEventManagement", ["Provides: IEventService", "Requires: IRepository<Event>", "Handles: draft, validate, submit"], 470, 120, 360, 140),
        ("<<component>>\nRegistrationComponent", ["Provides: IRegistrationService", "Requires: IEventService, IRepository", "Handles: capacity, eligibility"], 890, 120, 360, 140),
        ("<<component>>\nApprovalWorkflow", ["Provides: IApprovalService", "Requires: IEventService, INotificationService", "Handles: 2-pane queue, decisions"], 200, 330, 420, 150),
        ("<<component>>\nNotificationComponent", ["Provides: INotificationService", "Requires: IRepository<Notification>", "Handles: in-app notifications"], 700, 330, 420, 150),
        ("<<component>>\nPersistenceRepository", ["Provides: IRepository<T>, IWorkspaceRepository", "Requires: PostgreSQL Connection Pool", "Handles: ACID transactions, row locking"], 300, 540, 700, 160)
    ]

    for cname, details, x, y, cw, ch in components:
        draw_card(draw, x, y, cw, ch, cname)
        for i, d in enumerate(details):
            draw.text((x + 12, y + 50 + i * 22), "•  " + d, fill=(51, 65, 85))

    img.save(os.path.join(DIAG_DIR, 'Component-Design-Diagram.png'))
    print("Generated Component-Design-Diagram.png")

# ============================================================================
# 4. Wireframe UI-Wireframe-01 (Screen S1: Login)
# ============================================================================
def generate_wireframe_s1():
    w, h = 1000, 750
    img = create_canvas(w, h, bg_color=(241, 245, 249))
    draw = ImageDraw.Draw(img)
    draw_header(draw, "InstituteConnect — UI Wireframe: Screen S1 (User Login)",
                "Wireframe Specification matching Section 2.1 & Page 68 · Team T005", w)

    # Left story pane
    draw.rectangle([50, 100, 450, 680], fill=(30, 27, 75))
    draw.text((80, 140), "InstituteConnect", fill=(255, 255, 255))
    draw.text((80, 175), "ONE CAMPUS. COUNTLESS CONNECTIONS.", fill=(196, 181, 253))
    draw.text((80, 230), "Meaningful outreach.\nLasting impact.", fill=(255, 255, 255))
    draw.text((80, 300), "Bring institutions, students, and\nopportunities together in one\nsecure, unified workspace.", fill=(226, 232, 240))
    draw.text((80, 630), "LNMIIT, Jaipur · Team T005", fill=(148, 163, 184))

    # Right Login Form pane
    draw_card(draw, 450, 100, 500, 580, None, bg=(255, 255, 255))
    draw.text((500, 130), "PROSPECTIVE STUDENT / COORDINATOR / APPROVER PORTAL", fill=(99, 102, 241))
    draw.text((500, 155), "Sign In to Your Workspace", fill=(15, 23, 42))
    draw.text((500, 185), "Enter your credentials to access your outreach dashboard.", fill=(100, 116, 139))

    # Form Fields
    draw.text((500, 230), "Email Address *", fill=(51, 65, 85))
    draw.rectangle([500, 250, 900, 285], fill=(248, 250, 252), outline=(203, 213, 225))
    draw.text((515, 260), "user@lnmiit.ac.in", fill=(148, 163, 184))

    draw.text((500, 305), "Password *", fill=(51, 65, 85))
    draw.text((800, 305), "Forgot Password?", fill=(99, 102, 241))
    draw.rectangle([500, 325, 900, 360], fill=(248, 250, 252), outline=(203, 213, 225))
    draw.text((515, 335), "••••••••••••••••", fill=(148, 163, 184))

    # Sign In Button
    draw.rectangle([500, 385, 900, 425], fill=(99, 102, 241))
    draw.text((660, 397), "Sign In", fill=(255, 255, 255))

    # OR Divider
    draw.line([500, 455, 680, 455], fill=(226, 232, 240), width=1)
    draw.text((690, 447), "OR", fill=(148, 163, 184))
    draw.line([720, 455, 900, 455], fill=(226, 232, 240), width=1)

    # SSO Button
    draw.rectangle([500, 480, 900, 520], fill=(248, 250, 252), outline=(203, 213, 225))
    draw.text((605, 493), "Login with Institute Account (SSO)", fill=(30, 41, 59))

    # Error alert demonstration box
    draw.rectangle([500, 545, 900, 595], fill=(254, 242, 242), outline=(248, 113, 113))
    draw.text((515, 555), "Error Alert Demo Box:", fill=(185, 28, 28))
    draw.text((515, 573), "Invalid email or password. Please verify credentials.", fill=(185, 28, 28))

    draw.text((500, 620), "Staff roles are assigned by administrator. Accounts are protected by TLS & Neon Auth.", fill=(100, 116, 139))

    img.save(os.path.join(UI_DIR, 'UI-Wireframe-01.png'))
    print("Generated UI-Wireframe-01.png")

# ============================================================================
# 5. Wireframe UI-Wireframe-02 (Screen S2: Event Creation)
# ============================================================================
def generate_wireframe_s2():
    w, h = 1100, 900
    img = create_canvas(w, h, bg_color=(241, 245, 249))
    draw = ImageDraw.Draw(img)
    draw_header(draw, "InstituteConnect — UI Wireframe: Screen S2 (Event Creation & Modification)",
                "Wireframe Specification matching Section 2.2 & Page 69 (4 Sections) · Team T005", w)

    # Main modal card
    draw_card(draw, 50, 90, 1000, 780, "Create an Outreach Event Proposal", bg=(255, 255, 255))

    # Section 1: Basic Information
    draw.rectangle([70, 140, 1030, 260], fill=(248, 250, 252), outline=(226, 232, 240))
    draw.text((85, 150), "1. Basic Information", fill=(99, 102, 241))
    draw.text((85, 175), "Event Title *: [ Robotics Workshop 2026                            ]", fill=(51, 65, 85))
    draw.text((85, 205), "Category *:    [ Workshop ▾ ]", fill=(51, 65, 85))
    draw.text((85, 235), "Description *: [ Hands-on robotics session for aspiring engineering students. ]", fill=(51, 65, 85))

    # Section 2: Schedule & Venue
    draw.rectangle([70, 280, 1030, 400], fill=(248, 250, 252), outline=(226, 232, 240))
    draw.text((85, 290), "2. Schedule and Venue", fill=(99, 102, 241))
    draw.text((85, 315), "Event Date *:   [ 2026-11-20 ]          Start Time (IST) *: [ 10:00 ]       End Time (IST) *: [ 13:00 ]", fill=(51, 65, 85))
    draw.text((85, 345), "Event Mode *:   ( ) Offline   ( ) Online   ( ) Hybrid", fill=(51, 65, 85))
    draw.text((85, 375), "Venue / Location *: [ LNMIIT Campus, Computer Centre Lab 3, Jaipur               ]", fill=(51, 65, 85))

    # Section 3: Registration Details
    draw.rectangle([70, 420, 1030, 550], fill=(248, 250, 252), outline=(226, 232, 240))
    draw.text((85, 430), "3. Registration Details", fill=(99, 102, 241))
    draw.text((85, 455), "Registration Opens *:  [ 2026-10-01 ]          Registration Closes *: [ 2026-11-15 ]", fill=(51, 65, 85))
    draw.text((85, 485), "Capacity (seats) *:    [ 120        ]          Eligibility Criteria:  [ All students ▾ ]", fill=(51, 65, 85))
    draw.text((85, 515), "Instructions:          [ Arrive 15 minutes early. Bring photo ID and notepad. ]", fill=(51, 65, 85))

    # Section 4: Target Institutions & Contacts
    draw.rectangle([70, 570, 1030, 750], fill=(248, 250, 252), outline=(226, 232, 240))
    draw.text((85, 580), "4. Target Institutions & Associated Contacts", fill=(99, 102, 241))
    draw.text((85, 605), "Select Institutions: [ Delhi Public School, Jaipur [x]  |  Jayshree Periwal High School [x] ▾ ]", fill=(51, 65, 85))
    draw.text((85, 635), "Selected Target Chips: [DPS Jaipur (School)] [Jayshree Periwal High School (School)]", fill=(99, 102, 241))
    draw.text((85, 665), "Associated Contacts: [ Riya Verma (Counsellor) | Aditya Kapoor (Principal) ▾ ]", fill=(51, 65, 85))
    draw.text((85, 700), "Validation Rule: Submitted events require all 4 sections. Drafts require title and positive capacity.", fill=(100, 116, 139))

    # Bottom Actions
    draw.rectangle([70, 775, 170, 810], fill=(241, 245, 249), outline=(203, 213, 225))
    draw.text((100, 787), "Cancel", fill=(51, 65, 85))

    draw.rectangle([680, 775, 820, 810], fill=(241, 245, 249), outline=(99, 102, 241))
    draw.text((700, 787), "Save as Draft", fill=(99, 102, 241))

    draw.rectangle([835, 775, 1025, 810], fill=(99, 102, 241))
    draw.text((850, 787), "Submit for Approval", fill=(255, 255, 255))

    img.save(os.path.join(UI_DIR, 'UI-Wireframe-02.png'))
    print("Generated UI-Wireframe-02.png")

# ============================================================================
# 6. Wireframe UI-Wireframe-03 (Screen S3: Event Details & Registration)
# ============================================================================
def generate_wireframe_s3():
    w, h = 1200, 850
    img = create_canvas(w, h, bg_color=(241, 245, 249))
    draw = ImageDraw.Draw(img)
    draw_header(draw, "InstituteConnect — UI Wireframe: Screen S3 (Event Details & Registration)",
                "Wireframe Specification matching Section 2.3 & Page 70 · Team T005", w)

    # Top Navigation / Title
    draw.text((40, 85), "← Back to all outreach events", fill=(99, 102, 241))
    draw.text((40, 110), "Robotics Workshop 2026", fill=(15, 23, 42))
    draw.text((40, 140), "Organized by Divyansh Singh (Coordinator) · LNMIIT Outreach Cell", fill=(100, 116, 139))
    draw.rectangle([400, 110, 480, 132], fill=(220, 252, 231))
    draw.text((410, 115), "Workshop", fill=(22, 101, 52))
    draw.rectangle([490, 110, 560, 132], fill=(224, 231, 255))
    draw.text((505, 115), "Offline", fill=(67, 56, 202))
    draw.rectangle([570, 110, 650, 132], fill=(254, 243, 199))
    draw.text((580, 115), "Published", fill=(146, 64, 14))

    # Left content column
    draw_card(draw, 40, 170, 720, 650, "About This Experience", bg=(255, 255, 255))
    draw.text((60, 210), "An interactive hands-on robotics session where school and college students build their first", fill=(51, 65, 85))
    draw.text((60, 230), "autonomous line-following robot, interact with senior engineering faculty, and tour campus facilities.", fill=(51, 65, 85))

    # Schedule Table
    draw.text((60, 270), "Event Schedule & Agenda:", fill=(15, 23, 42))
    draw.rectangle([60, 295, 730, 410], fill=(248, 250, 252), outline=(226, 232, 240))
    draw.text((75, 305), "TIME (IST)", fill=(100, 116, 139))
    draw.text((220, 305), "SESSION ACTIVITY", fill=(100, 116, 139))
    draw.line([60, 325, 730, 325], fill=(226, 232, 240))
    draw.text((75, 335), "10:00 – 11:00", fill=(15, 23, 42))
    draw.text((220, 335), "Welcome Address & Faculty Introduction to Robotics", fill=(51, 65, 85))
    draw.text((75, 360), "11:00 – 12:00", fill=(15, 23, 42))
    draw.text((220, 360), "Hands-on Microcontroller & Sensor Interfacing Laboratory", fill=(51, 65, 85))
    draw.text((75, 385), "12:00 – 13:00", fill=(15, 23, 42))
    draw.text((220, 385), "Robotics Competition, Campus Tour & Certificate Distribution", fill=(51, 65, 85))

    # Important Notes Box
    draw.rectangle([60, 430, 730, 490], fill=(238, 242, 255), outline=(199, 210, 254))
    draw.text((75, 440), "Important Information:", fill=(67, 56, 202))
    draw.text((75, 460), "Arrive 15 minutes before 10:00 AM IST. Carry valid student photo ID. Laptops provided in lab.", fill=(51, 65, 85))

    # Target & Eligibility
    draw.text((60, 510), "Target Audience & Eligibility:", fill=(15, 23, 42))
    draw.text((60, 535), "• Eligibility: All students (Class 10, 11, 12 and Undergraduate)", fill=(51, 65, 85))
    draw.text((60, 555), "• Partner Institutions: Delhi Public School, Jayshree Periwal High School, St. Xavier's", fill=(51, 65, 85))

    # Contact Information Box
    draw.rectangle([60, 590, 730, 680], fill=(248, 250, 252), outline=(226, 232, 240))
    draw.text((75, 600), "Contact Information:", fill=(15, 23, 42))
    draw.text((75, 625), "Outreach Cell:  LNMIIT Admissions Office  |  Email: outreach@instituteconnect.edu.in", fill=(51, 65, 85))
    draw.text((75, 650), "Helpline:       +91 98765 43210          |  Location: Rupa ki Nangal, Post-Sumel, Jaipur", fill=(51, 65, 85))

    # Right Sidebar (Registration Card)
    draw_card(draw, 780, 170, 380, 500, "Registration Details", bg=(255, 255, 255))
    draw.rectangle([800, 215, 960, 240], fill=(220, 252, 231))
    draw.text((815, 222), "Registration Open", fill=(22, 101, 52))

    draw.text((800, 255), "Date: 2026-11-20 (Saturday)", fill=(51, 65, 85))
    draw.text((800, 280), "Time: 10:00 – 13:00 IST", fill=(51, 65, 85))
    draw.text((800, 305), "Venue: LNMIIT Campus, Jaipur", fill=(51, 65, 85))

    # Places filled meter
    draw.text((800, 340), "Seat Occupancy:", fill=(51, 65, 85))
    draw.rectangle([800, 360, 1130, 375], fill=(226, 232, 240))
    draw.rectangle([800, 360, 950, 375], fill=(99, 102, 241))
    draw.text((800, 385), "48 / 120 places filled (72 seats remaining)", fill=(100, 116, 139))
    draw.text((800, 410), "Window: 2026-10-01 to 2026-11-15", fill=(100, 116, 139))

    # User registration status & CTA
    draw.text((800, 450), "Your Registration Status:", fill=(51, 65, 85))
    draw.text((800, 470), "[ Not Registered ]", fill=(100, 116, 139))

    draw.rectangle([800, 500, 1130, 545], fill=(99, 102, 241))
    draw.text((880, 515), "Register for Event", fill=(255, 255, 255))

    draw.text((800, 560), "Registered participants receive instant in-app\nconfirmation and reminder updates before the event.", fill=(148, 163, 184))

    img.save(os.path.join(UI_DIR, 'UI-Wireframe-03.png'))
    print("Generated UI-Wireframe-03.png")

# ============================================================================
# 7. Wireframe UI-Wireframe-04 (Screen S4: Event Approval Review)
# ============================================================================
def generate_wireframe_s4():
    w, h = 1300, 900
    img = create_canvas(w, h, bg_color=(241, 245, 249))
    draw = ImageDraw.Draw(img)
    draw_header(draw, "InstituteConnect — UI Wireframe: Screen S4 (Event Approval Review)",
                "Two-Pane Split Review Layout matching Section 2.4 & Page 71 · Team T005", w)

    # Sub-header stats
    draw.text((40, 85), "Event Proposals Requiring Review & Approval Decisions", fill=(15, 23, 42))

    # Left Pane: Pending Events Queue
    draw_card(draw, 40, 120, 440, 740, "Pending Events (3)", bg=(255, 255, 255))
    draw.rectangle([60, 160, 460, 195], fill=(248, 250, 252), outline=(203, 213, 225))
    draw.text((75, 170), "🔍 Search proposals by title or venue...", fill=(148, 163, 184))

    # Filter dropdowns
    draw.rectangle([60, 205, 250, 235], fill=(255, 255, 255), outline=(203, 213, 225))
    draw.text((70, 214), "Category: All ▾", fill=(51, 65, 85))
    draw.rectangle([270, 205, 460, 235], fill=(255, 255, 255), outline=(203, 213, 225))
    draw.text((280, 214), "Mode: All ▾", fill=(51, 65, 85))

    # Pending Event Cards
    events = [
        ("Science on Wheels: School Outreach", "School visit · 2026-11-12 · 80 seats", True),
        ("Robotics Workshop 2026", "Workshop · 2026-11-20 · 120 seats", False),
        ("AI & Machine Learning Orientation", "Webinar · 2026-11-28 · 200 seats", False)
    ]
    for i, (title, meta, active) in enumerate(events):
        cy = 255 + i * 115
        bg = (238, 242, 255) if active else (255, 255, 255)
        border = (99, 102, 241) if active else (226, 232, 240)
        draw.rectangle([60, cy, 460, cy + 100], fill=bg, outline=border, width=2 if active else 1)
        draw.text((75, cy + 12), title, fill=(15, 23, 42))
        draw.text((75, cy + 38), meta, fill=(100, 116, 139))
        draw.rectangle([360, cy + 65, 445, cy + 87], fill=(254, 243, 199))
        draw.text((370, cy + 70), "Under Review", fill=(146, 64, 14))

    # Pagination
    draw.text((60, 620), "Showing Page 1 of 1 · 3 proposals", fill=(100, 116, 139))
    draw.rectangle([300, 615, 370, 640], fill=(241, 245, 249), outline=(203, 213, 225))
    draw.text((315, 622), "< Prev", fill=(148, 163, 184))
    draw.rectangle([385, 615, 455, 640], fill=(241, 245, 249), outline=(203, 213, 225))
    draw.text((400, 622), "Next >", fill=(148, 163, 184))

    # Right Pane: Detailed Event Inspection & Decision
    draw_card(draw, 500, 120, 760, 740, "Proposal Details & Decision Panel", bg=(255, 255, 255))
    draw.text((530, 160), "Science on Wheels: School Outreach", fill=(15, 23, 42))
    draw.text((530, 190), "Organized by Divyansh Singh (Coordinator) · Submitted for Formal Review", fill=(100, 116, 139))

    # Metadata Grid
    draw.rectangle([530, 220, 1230, 290], fill=(248, 250, 252), outline=(226, 232, 240))
    draw.text((545, 232), "Date: 2026-11-12", fill=(51, 65, 85))
    draw.text((740, 232), "Time: 09:30 – 14:00 IST", fill=(51, 65, 85))
    draw.text((980, 232), "Capacity: 80 places", fill=(51, 65, 85))
    draw.text((545, 260), "Mode: Offline (Bus Visit)", fill=(51, 65, 85))
    draw.text((740, 260), "Venue: Central Academy, Ajmer", fill=(51, 65, 85))
    draw.text((980, 260), "Eligibility: Class 10 & 11", fill=(51, 65, 85))

    # Description & Schedule
    draw.text((530, 310), "Description & Scope:", fill=(15, 23, 42))
    draw.text((530, 330), "Mobile science laboratory visiting partner schools to demonstrate physics experiments", fill=(51, 65, 85))
    draw.text((530, 350), "and generate early interest in undergraduate engineering pathways.", fill=(51, 65, 85))

    # Schedule Table
    draw.rectangle([530, 380, 1230, 480], fill=(248, 250, 252), outline=(226, 232, 240))
    draw.text((545, 390), "09:30 – 10:30 IST:  Arrival, equipment setup and school assembly introduction", fill=(51, 65, 85))
    draw.text((545, 415), "10:30 – 12:30 IST:  Live demonstrations in optics, electromagnetism & robotics", fill=(51, 65, 85))
    draw.text((545, 440), "12:30 – 14:00 IST:  Interactive student Q&A, counselling and teacher feedback", fill=(51, 65, 85))

    # Target Institutions
    draw.text((530, 500), "Target Institutions: Central Academy (Ajmer), St. Xavier's Secondary School", fill=(51, 65, 85))

    # Decision Panel (Assignment 7 Wireframe S4 specification)
    draw.rectangle([530, 540, 1230, 720], fill=(248, 250, 252), outline=(99, 102, 241), width=2)
    draw.text((550, 555), "Record Approval Decision", fill=(67, 56, 202))
    draw.text((550, 580), "Review Comments / Rejection Reason (Mandatory if rejecting proposal):", fill=(51, 65, 85))
    draw.rectangle([550, 605, 1210, 660], fill=(255, 255, 255), outline=(203, 213, 225))
    draw.text((560, 615), "Proposal meets all pedagogical and logistical requirements. Transportation verified.", fill=(15, 23, 42))

    # Buttons
    draw.rectangle([930, 675, 1060, 705], fill=(239, 68, 68))
    draw.text((950, 685), "Reject Proposal", fill=(255, 255, 255))

    draw.rectangle([1075, 675, 1210, 705], fill=(16, 185, 129))
    draw.text((1090, 685), "Approve Proposal", fill=(255, 255, 255))

    draw.text((530, 740), "Rule: Rejections require non-empty reasons. Decisions notify coordinators and update history atomically.", fill=(100, 116, 139))

    img.save(os.path.join(UI_DIR, 'UI-Wireframe-04.png'))
    print("Generated UI-Wireframe-04.png")

if __name__ == '__main__':
    generate_class_diagram()
    generate_architectural_diagram()
    generate_component_diagram()
    generate_wireframe_s1()
    generate_wireframe_s2()
    generate_wireframe_s3()
    generate_wireframe_s4()
    print("All 7 diagrams and wireframes generated successfully!")
