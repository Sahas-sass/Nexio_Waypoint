# AI Tool Usage Disclosure

**Competition:** Tech-Triathlon 2026 (Rootcode) — Datathon Phase  
**Team Name:** Nexio  
**Date:** October 9, 2026  

---

### Declaration of AI Tool Usage

In accordance with the competition rules and ethics guidelines for the Tech-Triathlon 2026 Datathon Phase:

1. **AI Coding Assistants Used:**
   - Antigravity / Google Advanced Coding Agent (DeepMind): Utilized as an interactive pair-programming assistant for rapid exploratory data analysis, feature engineering scripting, mathematical formulation of the Mixed-Integer Linear Program (MILP), and markdown documentation compilation.

2. **Compliance with Model Restrictions:**
   - **No Pre-trained Foundation / Black-Box Models in Prediction Pipeline:** In strict accordance with the Datathon guidelines, no pre-trained deep learning checkpoints, external cloud prediction APIs (such as OpenAI GPT, Claude, or Gemini inference endpoints), or commercial AutoML black-box systems were used to generate predictions.
   - **Independent Feature & ML Modeling:** All predictive models deployed for Task 1 (LightGBM Gradient Boosted Decision Trees) and Task 2A (Ridge / LightGBM time-series ensembles with lag tracking) were trained from scratch exclusively on the official historical datasets provided (`deliveries_train.csv`, `route_legs_train.csv`, `task1_test_inputs.csv`, and auxiliary general datasets).
   - **Deterministic Combinatorial Solver:** Task 2B optimization was formulated from mathematical first principles as an exact 0-1 Mixed-Integer Linear Program and solved using the open-source COIN-OR CBC (Coin-or branch and cut) solver via PuLP.

3. **Verification of Output Integrity:**
   - All code, mathematical constraints, and output predictions were audited, cross-validated via out-of-fold metrics, and validated using the official Rootcode feasibility checker (`check_allocation.py`).

**Team Nexio affirms that all deliverables represent sound, reproducible, and compliant engineering.**
