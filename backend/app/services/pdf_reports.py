from fpdf import FPDF
from datetime import datetime, date
from decimal import Decimal
from typing import List, Dict, Any, Optional

class ReportPDF(FPDF):
    def __init__(self, title="REPORT", subtitle="", *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.report_title = title
        self.report_subtitle = subtitle

    def header(self):
        # Institution Header
        self.set_font('Helvetica', 'B', 15)
        self.set_text_color(0, 75, 135) # Brand blue
        self.cell(0, 8, 'WE GROW EDUCATIONAL & TRAINING INSTITUTION', align='C', new_x="LMARGIN", new_y="NEXT")

        self.set_font('Helvetica', '', 9)
        self.set_text_color(100, 116, 139)
        self.cell(0, 5, 'Campus ERP & Institutional Management Portal', align='C', new_x="LMARGIN", new_y="NEXT")
        
        # Report Title
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(15, 23, 42)
        self.cell(0, 7, self.report_title, align='C', new_x="LMARGIN", new_y="NEXT")

        if self.report_subtitle:
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(71, 85, 105)
            self.cell(0, 4, self.report_subtitle, align='C', new_x="LMARGIN", new_y="NEXT")

        self.ln(2)
        self.set_draw_color(203, 213, 225)
        self.set_line_width(0.3)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-12)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(148, 163, 184)
        self.cell(0, 8, f'Page {self.page_no()}/{{nb}}  |  Generated on {datetime.now().strftime("%d-%m-%Y %I:%M %p")}', align='C')


def generate_staff_list_pdf(
    staff_records: List[Dict[str, Any]],
    current_status: str = "Active",
    salary_filter: str = "without_salary",
    search_query: str = ""
) -> bytes:
    """
    Generates a high-quality PDF report for Staff Directory matching rpt_staff_list.php reference.
    """
    with_salary = (salary_filter in ["with_salary", "all"])
    
    # Subtitle with filters
    sub_parts = [f"Status: {current_status.title()}"]
    if search_query:
        sub_parts.append(f"Search: '{search_query}'")
    sub_parts.append(f"Salary Filter: {'With Salary' if with_salary else 'Without Salary'}")
    sub_parts.append(f"Total Records: {len(staff_records)}")
    subtitle = " | ".join(sub_parts)

    title = f"STAFF DIRECTORY REPORT ({current_status.upper()} STAFF)"
    
    # Create PDF in Landscape A4 (297 x 210 mm)
    pdf = ReportPDF(title=title, subtitle=subtitle, orientation='L', unit='mm', format='A4')
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Column widths (Total available width: 297 - 20 = 277 mm)
    if with_salary:
        col_widths = {
            "sno": 12,
            "staff_id": 24,
            "name": 45,
            "number": 30,
            "role": 40,
            "salary": 30,
            "doj": 26,
            "username": 40,
            "status": 25
        }
    else:
        col_widths = {
            "sno": 12,
            "staff_id": 26,
            "name": 52,
            "number": 34,
            "role": 46,
            "doj": 30,
            "username": 46,
            "status": 26
        }

    # Header Row
    pdf.set_font('Helvetica', 'B', 8.5)
    pdf.set_fill_color(0, 86, 179) # #0056b3
    pdf.set_text_color(255, 255, 255)
    pdf.set_draw_color(203, 213, 225)
    
    pdf.cell(col_widths["sno"], 7.5, 'SNO', border=1, align='C', fill=True)
    pdf.cell(col_widths["staff_id"], 7.5, 'STAFF ID', border=1, align='C', fill=True)
    pdf.cell(col_widths["name"], 7.5, 'STAFF NAME', border=1, align='L', fill=True)
    pdf.cell(col_widths["number"], 7.5, 'CONTACT NUMBER', border=1, align='C', fill=True)
    pdf.cell(col_widths["role"], 7.5, 'ROLE', border=1, align='L', fill=True)
    if with_salary:
        pdf.cell(col_widths["salary"], 7.5, 'SALARY (INR)', border=1, align='R', fill=True)
    pdf.cell(col_widths["doj"], 7.5, 'DOJ', border=1, align='C', fill=True)
    pdf.cell(col_widths["username"], 7.5, 'USERNAME', border=1, align='L', fill=True)
    pdf.cell(col_widths["status"], 7.5, 'STATUS', border=1, align='C', fill=True)
    pdf.ln()

    # Data Rows
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(30, 41, 59) # Slate 800

    if not staff_records:
        pdf.set_font('Helvetica', 'I', 9)
        pdf.set_text_color(148, 163, 184)
        total_w = sum(col_widths.values())
        pdf.cell(total_w, 12, 'No staff records found matching the filter criteria.', border=1, align='C')
        pdf.ln()
    else:
        for idx, s in enumerate(staff_records):
            # Alternating background color
            fill = (idx % 2 == 1)
            pdf.set_fill_color(248, 250, 252) if fill else pdf.set_fill_color(255, 255, 255)

            # Format DOJ
            doj_str = "-"
            if s.get("doj"):
                try:
                    d_obj = datetime.strptime(str(s["doj"])[:10], "%Y-%m-%d")
                    doj_str = d_obj.strftime("%d-%m-%Y")
                except Exception:
                    doj_str = str(s["doj"])

            st_id = s.get("staff_id") or f"ST{s.get('id', 0):03d}"
            name = s.get("staff_name") or s.get("name") or "-"
            number = s.get("staff_number") or s.get("number") or "-"
            role = s.get("role") or s.get("role_name") or "staff"
            uname = s.get("username") or "-"
            status = s.get("status") or "Active"

            pdf.cell(col_widths["sno"], 7, str(idx + 1), border=1, align='C', fill=fill)
            
            # Staff ID with font boldness
            pdf.set_font('Helvetica', 'B', 8)
            pdf.cell(col_widths["staff_id"], 7, st_id, border=1, align='C', fill=fill)
            
            pdf.set_font('Helvetica', '', 8)
            pdf.cell(col_widths["name"], 7, name[:24], border=1, align='L', fill=fill)
            pdf.cell(col_widths["number"], 7, number[:15], border=1, align='C', fill=fill)
            pdf.cell(col_widths["role"], 7, role[:22], border=1, align='L', fill=fill)
            
            if with_salary:
                sal_val = float(s.get("salary") or 0)
                pdf.cell(col_widths["salary"], 7, f"{sal_val:,.2f}", border=1, align='R', fill=fill)

            pdf.cell(col_widths["doj"], 7, doj_str, border=1, align='C', fill=fill)
            pdf.cell(col_widths["username"], 7, uname[:20], border=1, align='L', fill=fill)
            
            # Status
            pdf.cell(col_widths["status"], 7, status, border=1, align='C', fill=fill)
            pdf.ln()

    return bytes(pdf.output())
