<%@ page import="java.util.List"%>
<%@ page import="io.brooklyn.cf.example.riak.RiakServlet.Message"%>
<html>
<head>
<title>Sample Application Riak</title>
</head>
<body>
	<h1>Riak Example</h1>
	<ul>
		<%
			List<Message> messages = (List<Message>) request.getAttribute("result");

			if (messages.isEmpty()) {
		%>
		<li><i>None</i></li>
		<%
			}
			for (Message message : messages) {
		%>
		<li><b><%=message.name%></b>: <%=message.message%></li>
		<%
			}
		%>

	</ul>

	<p>Please enter a message:</p>

	<form action="riak" method="POST">
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