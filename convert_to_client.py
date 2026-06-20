import os
import glob
import re

files_to_convert = [
    "app/authority/page.tsx",
    "app/citizen/page.tsx",
    "app/citizen/layout.tsx",
    "app/authority/layout.tsx",
    "app/citizen/issues/page.tsx",
    "app/citizen/issues/[id]/page.tsx",
    "app/authority/issues/[id]/page.tsx",
    "app/authority/issues/page.tsx",
    "app/admin/users/page.tsx",
    "app/admin/page.tsx",
    "app/admin/layout.tsx",
    "app/admin/analytics/page.tsx",
    "app/admin/issues/page.tsx",
    "app/admin/issues/[id]/page.tsx"
]

base_dir = "c:/Users/KAVYA/Downloads/WEBSITES/Civic-Connect-app"

for file_path in files_to_convert:
    full_path = os.path.join(base_dir, file_path)
    if not os.path.exists(full_path):
        continue
    
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if '"use client"' in content or "'use client'" in content:
        continue
    
    # Replace imports
    content = content.replace('import { createClient } from "@/lib/supabase/server"', 'import { createClient } from "@/lib/supabase/client"\nimport { useEffect, useState } from "react"')
    
    # Find the main export default async function
    func_match = re.search(r'export default async function\s+(\w+)\s*\((.*?)\)\s*{', content)
    if not func_match:
        continue
    
    func_name = func_match.group(1)
    params = func_match.group(2)
    
    # We will replace the entire function body with a useEffect wrapper.
    # But since it's hard to parse matching braces in python regex, 
    # we can just use a simple state wrapper approach:
    
    # 1. remove async
    content = content.replace(f'export default async function {func_name}', f'export default function {func_name}')
    
    # 2. replace await createClient() with createClient()
    content = content.replace('await createClient()', 'createClient()')
    
    # Actually, a better way is to just let the component remain the same,
    # but remove the `await` before supabase.auth and supabase.from, 
    # BUT `supabase.from` in our mock returns an object with `then`, so it's a promise!
    # If it's a promise, React Client Components CANNOT await it in the render body.
    # It will throw an error "Objects are not valid as a React child" or "Cannot use async function in client component".

    print(f"Skipping {file_path} - manual conversion required for React state.")
