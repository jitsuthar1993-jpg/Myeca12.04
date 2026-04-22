import sys

file_path = r'c:\Users\jitsu\OneDrive\Desktop\Websites\Myeca.in\Myeca12.04\client\src\components\layout\Header.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Desktop replacement
old_desktop = """                                  { href: "/compliance-calendar", icon: Calendar, title: "Compliance Calendar", desc: "GST & Tax Deadlines", color: "indigo" },
                                })}"""
new_desktop = """                                  { href: "/compliance-calendar", icon: Calendar, title: "Compliance Calendar", desc: "GST & Tax Deadlines", color: "indigo" },
                                  { href: "/calculators/penalty", icon: ShieldAlert, title: "Penalty Calculator", desc: "GST & Tax Delay Costs", color: "orange" },
                                })}"""

# Mobile replacement
old_mobile = """                                     <Link href="/calculators/emi" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">EMI Calculator</Link>
                                     <Link href="/calculators/home-loan" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Loan EMI Calculator</Link>
                                  </div>"""
new_mobile = """                                     <Link href="/calculators/emi" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">EMI Calculator</Link>
                                     <Link href="/calculators/home-loan" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Loan EMI Calculator</Link>
                                     <Link href="/compliance-calendar" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Compliance Calendar</Link>
                                     <Link href="/calculators/penalty" className="block py-1.5 text-sm text-slate-600 hover:text-blue-600">Penalty Calculator</Link>
                                  </div>"""

if old_desktop in content:
    content = content.replace(old_desktop, new_desktop)
    print("Desktop replaced")
else:
    print("Desktop NOT found")

if old_mobile in content:
    content = content.replace(old_mobile, new_mobile)
    print("Mobile replaced")
else:
    print("Mobile NOT found")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
