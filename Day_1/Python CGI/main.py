import cgi
import cgitb
cgitb.enable()

form = cgi.FieldStorage()
if ("name" not in form or "addr" not in form):
    print("<H1>Error</H1>")
    print("Please enter the information in the name and address fields.")

print("<p>name:", form["name"].value)
print("<p>addr:", form["addr"].value)
