<%@ page import="com.mongodb.DBObject"%>
<%@ page import="com.mongodb.DBCursor"%>
<html>
<head>
    <title>Sample Application MongoDB</title>
</head>
<body>

	<h1>MongoDB Example</h1>
	<ul>
		<%
			int i = 0;
			DBCursor result = (DBCursor) request.getAttribute("result");
			try {
				while (result.hasNext()) {
					DBObject message = result.next();
					i++;
		%><li><b><%=message.get("name")%></b>: <%=message.get("message")%></li>
		<%
				}
			} finally {
				result.close();
			}

			if (i == 0) {
		%>
		<li><i>None</i></li>
		<%
			}
		%>

	</ul>

	<p>Please enter a message:</p>

	<form action="/" method="POST">
		<table>
			<tr>
				<td>Name:</td>
				<td><input type="text" name="name"></td>
			</tr>
			<tr>
				<td>Message:</td>
				<td><input type="text" name="message"></td>
			</tr>
		</table>
		<input type="submit" value="Submit" />
	</form>

</body>
</html>
