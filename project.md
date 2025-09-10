Berlin Hackathon 2025 - Energy Data Visualization Project
🎯 Project Overview
Theme: "Bridging the gap between system operations and electricity markets"
Host: 50Hertz
Duration: September 9-10, 2025
Location: Berlin
📋 Hackathon Structure
Day 1: September 9th
09:00-09:15: Welcome
09:15-10:00: Data visualization keynote by Koen van den Eeckhout (Baryon)
10:00-12:30: Teamwork Block 1
12:30-13:30: Lunch break
13:30-17:00: Teamwork Block 2
17:00-18:00: Wrap-up
18:00-20:00: Barbecue @ 50Hertz Netzquartier
Day 2: September 10th
09:00-09:20: MCCS keynote by Arya
09:20-12:00: Teamwork Block 3
12:00-13:00: Lunch break
13:00-14:00: Teamwork Block 4
14:00-15:30: Team pitches (10 min each: 5 min pitch + 5 min Q&A)
16:15: Winner announcement
🏆 Evaluation Criteria
Criteria	Weight	Description
Impact	/5	Analysis addresses problem statement and research question
Innovation	/5	Creative, original, out-of-the-box thinking
Feasibility	/5	Easily applicable in day-to-day operations
Pitch	/5	Well-structured and convincing presentation
Visualization	+2 bonus	Extra points for exceptional visuals
Scoring Scale: Exceeds (5), Meets (3), Falls short (1)
🎯 Our Project Focus
Problem Statement
Interconnector Flow Prediction and Grid Constraint Visualization
Interconnectors often flow in opposite directions and create tight margins in Great Britain. We need to:
Visualize constraints in specific zones
Predict GB constraints based on French electricity prices
Create an alert system for grid operators
Research Question
"Do electricity prices in France (highly interconnected region) predict constraints in Great Britain, and can we create a predictive visualization tool?"
Approach
Historical Analysis: Look back over historic periods to identify patterns
Data Integration: Combine French energy prices (ENTSO-E) with GB constraints data (NESO)
Predictive Tool: Develop a RAG (Red-Amber-Green) rating system for constraints
Operational Value: Alert National Grid ESO to trade differently based on predictions
📊 Data Sources
Primary Data Sources
NESO Historic Demand Data: https://api.neso.energy/api/3/action/datastore_search?resource_id=b2bde559-3455-4021-b179-dfe60c0337b0
Constraints Data: https://www.neso.energy/data-portal/constraint-breakdown
BSAD Data (reversing flows on interconnectors): https://www.neso.energy/data-portal/disaggregated-bsad
French Energy Prices: ENTSO-E Transparency Platform
Key Data Fields (NESO API)
Settlement Date/Period: Time stamps for half-hourly data
National Demand (ND): GB generation requirement (MW)
Transmission System Demand (TSD): Including station load, pumping, exports (MW)
Interconnector Flows:
IFA_FLOW, IFA2_FLOW (France)
BRITNED_FLOW (Netherlands)
NEMO_FLOW (Belgium)
NSL_FLOW (Norway)
ELECLINK_FLOW, VIKING_FLOW, GREENLINK_FLOW
Embedded Generation: Wind and Solar estimates (MW)
Scottish Transfer: Power flow Scotland ↔ England/Wales (MW)
🛠 Technical Implementation
Current Dashboard Features
Octopus Energy Branding: Custom purple theme (rgb(88,30,192), rgb(13,1,46), rgb(21,1,69))
Real-time Charts:
Demand visualization (National vs Transmission System Demand)
Embedded generation (Wind vs Solar)
Data Integration: Live NESO API integration with 5-minute refresh
Responsive Design: shadcn/ui components with Tailwind CSS
Next Development Phases
Phase 1: Enhanced Visualization
[ ] Add interconnector flow charts
[ ] Implement constraint visualization
[ ] Create French price integration
[ ] Add historical trend analysis
Phase 2: Predictive Analytics
[ ] Develop correlation analysis between French prices and GB constraints
[ ] Implement machine learning model for constraint prediction
[ ] Create RAG rating system
[ ] Add alert mechanisms
Phase 3: Operational Tools
[ ] Real-time monitoring dashboard
[ ] Automated alert system
[ ] Export capabilities for grid operators
[ ] Mobile-responsive interface
🎨 Design Philosophy
Visual Identity
Primary Color: rgb(88, 30, 192) - Octopus Energy purple
Background: rgb(13, 1, 46) - Deep purple
Surfaces: rgb(21, 1, 69) - Card backgrounds
Text: White for maximum contrast
No White Surfaces: Maintaining brand consistency
User Experience Principles
Clarity: Clear, actionable insights for grid operators
Speed: Real-time data with minimal latency
Accessibility: High contrast, readable typography
Responsiveness: Works across devices and screen sizes
🎯 Success Metrics
Technical Success
[ ] Live data integration from multiple sources
[ ] Accurate constraint prediction model
[ ] Responsive, performant dashboard
[ ] Clean, maintainable codebase
Business Impact
[ ] Actionable insights for grid operators
[ ] Improved interconnector trading decisions
[ ] Reduced grid constraint costs
[ ] Enhanced system stability
Hackathon Success
[ ] Compelling 5-minute pitch
[ ] Innovative visualization approach
[ ] Feasible implementation plan
[ ] Strong technical demonstration
🤝 Team Resources
Mentorship Available
Koen van den Eeckhout (Baryon): Data visualization expert
Helge Esch (50Hertz): Host and industry expert
Julia Breuing: External data analytics advisor
Marius Schrade (50Hertz): Co-host
Facilities
Library Area: Team working hubs
Meeting Room 0.1: Cross-team collaboration space
Mentoring Booths: One-on-one guidance sessions
Single Booths: Private calls and focus work
📈 Project Roadmap
Immediate Goals (Day 1)
✅ Set up Next.js dashboard with Octopus Energy branding
✅ Integrate NESO API for real-time demand data
✅ Create initial demand and generation visualizations
🔄 Add interconnector flow charts
🔄 Research French price data integration
Day 2 Goals
🔄 Implement constraint prediction model
🔄 Create RAG rating system
🔄 Build comprehensive dashboard
🔄 Prepare compelling pitch presentation
🔄 Test and refine user experience
Post-Hackathon Vision
Production-ready tool for National Grid ESO
Integration with existing grid operation systems
Continuous model improvement with real-world feedback
Potential expansion to other interconnected regions
This project aims to bridge the gap between electricity markets and system operations by providing grid operators with predictive insights based on interconnected market signals, ultimately improving grid stability and reducing operational costs.


