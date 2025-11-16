#!/usr/bin/env python3
"""
Database checker for clan_members table constraints
"""
import os
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    # Initialize Supabase client
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
        return
    
    supabase: Client = create_client(url, key)
    
    try:
        print("🔍 Checking clan_members table structure...")
        
        # Check existing roles in the table
        response = supabase.table("clan_members").select("role").limit(10).execute()
        
        if response.data:
            roles = [member["role"] for member in response.data]
            print(f"✅ Existing roles in database: {set(roles)}")
        else:
            print("📋 No existing members found in clan_members table")
        
        # Try to get table schema
        print("\n🏗️ Checking table constraints...")
        
        # Query pg_constraint for check constraints
        constraint_query = """
        SELECT 
            conname as constraint_name,
            pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = 'clan_members'::regclass 
        AND contype = 'c'
        """
        
        try:
            # Use RPC to execute raw SQL
            result = supabase.rpc('exec_sql', {'query': constraint_query}).execute()
            
            if result.data:
                print("📋 Check constraints found:")
                for constraint in result.data:
                    print(f"   - {constraint['constraint_name']}: {constraint['definition']}")
            else:
                print("❌ No check constraints found or cannot access them")
                
        except Exception as e:
            print(f"❌ Cannot query constraints directly: {e}")
            print("💡 This is normal if exec_sql RPC function doesn't exist")
        
        # Check what the app expects vs what the DB has
        expected_roles = ['Leader', 'Moderator', 'Member']
        print(f"\n🎯 Expected roles in app: {expected_roles}")
        
        # Test inserting a member with correct role (dry run)
        print("\n🧪 Testing role values...")
        for role in expected_roles:
            print(f"   ✓ '{role}' - Expected to work")
            
        print("\n💡 The error suggests the role value being inserted doesn't match the check constraint.")
        print("   Common issues:")
        print("   - Case sensitivity: 'member' vs 'Member'")
        print("   - Extra whitespace: ' Member ' vs 'Member'") 
        print("   - Different enum values in database vs app")
        
        # Try to insert a test member to see the exact error
        print("\n🧪 Attempting test insertion to see exact error...")
        
        # First, get a user profile to use for testing
        profiles = supabase.table("user_profiles").select("id").limit(1).execute()
        
        if profiles.data:
            test_user_id = profiles.data[0]["id"]
            
            # Get a clan to join
            clans = supabase.table("clans").select("id").limit(1).execute()
            
            if clans.data:
                test_clan_id = clans.data[0]["id"]
                
                try:
                    # Attempt to insert with 'Member' role
                    test_insert = supabase.table("clan_members").insert({
                        "user_id": test_user_id,
                        "clan_id": test_clan_id,
                        "role": "Member",
                        "xp_contributed": 0
                    }).execute()
                    
                    print("✅ Test insertion successful with role 'Member'")
                    
                    # Clean up - delete the test record
                    supabase.table("clan_members").delete().eq("user_id", test_user_id).eq("clan_id", test_clan_id).execute()
                    print("🧹 Cleaned up test record")
                    
                except Exception as insert_error:
                    print(f"❌ Test insertion failed: {insert_error}")
                    print("   This shows the exact constraint violation!")
                    
                    # Try with lowercase
                    try:
                        test_insert = supabase.table("clan_members").insert({
                            "user_id": test_user_id,
                            "clan_id": test_clan_id,
                            "role": "member",
                            "xp_contributed": 0
                        }).execute()
                        
                        print("✅ Test insertion successful with role 'member' (lowercase)")
                        # Clean up
                        supabase.table("clan_members").delete().eq("user_id", test_user_id).eq("clan_id", test_clan_id).execute()
                        
                    except Exception as e2:
                        print(f"❌ Lowercase 'member' also failed: {e2}")
            else:
                print("❌ No clans found for testing")
        else:
            print("❌ No user profiles found for testing")
            
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")

if __name__ == "__main__":
    main()