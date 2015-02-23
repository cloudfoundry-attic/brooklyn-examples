package io.brooklyn.cf.example.riak;

import java.io.IOException;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.joda.time.DateTime;

import com.basho.riak.client.api.RiakClient;
import com.basho.riak.client.api.commands.kv.FetchValue;
import com.basho.riak.client.api.commands.kv.ListKeys;
import com.basho.riak.client.api.commands.kv.StoreValue;
import com.basho.riak.client.core.RiakCluster;
import com.basho.riak.client.core.RiakNode;
import com.basho.riak.client.core.query.Location;
import com.basho.riak.client.core.query.Namespace;

public class RiakServlet extends HttpServlet {

	private static final long serialVersionUID = 4095939036272621375L;

	public static class Message {

		public String name;
		public String message;
		public DateTime dateTime;

	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		RiakClient client = createRiakClient(req);
		Namespace messageBucket = new Namespace("messages");
		ListKeys lk = new ListKeys.Builder(messageBucket).build();
		try {
			ListKeys.Response response = client.execute(lk);
			List<Message> messages = new ArrayList<Message>();
			for (Location l : response) {
				FetchValue fetchOp = new FetchValue.Builder(l).build();
				Message value = client.execute(fetchOp).getValue(Message.class);
				messages.add(value);
			}
			Collections.sort(messages, new Comparator<Message>(){

				@Override
				public int compare(Message m1, Message m2) {
					return m1.dateTime.compareTo(m2.dateTime);
				}
				
			});
			req.setAttribute("result", messages);
			req.getRequestDispatcher("riak.jsp").forward(req, resp);
		} catch (Exception e) {
			e.printStackTrace(resp.getWriter());
		}
		

	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		RiakClient client = createRiakClient(req);
		Message m = new Message();
		m.name = req.getParameter("name");
		m.message = req.getParameter("message");
		m.dateTime = new DateTime();
		Namespace messageBucket = new Namespace("messages");
		Location messageLocation = new Location(messageBucket, m.name + m.dateTime);
		StoreValue storeMessageOp = new StoreValue.Builder(m).withLocation(
				messageLocation).build();
		try {
			client.execute(storeMessageOp);
			resp.sendRedirect("/");
		} catch (Exception e) {
			e.printStackTrace(resp.getWriter());
		}
	}

	private RiakClient createRiakClient(HttpServletRequest req)
			throws UnknownHostException {
		String vcap = System.getenv("VCAP_SERVICES");
		
		// TODO: parse vap for credentials
		
		return new RiakClient(createCluster(
				Arrays.asList(
						createNode("127.0.0.1", 8100)
				)
				));
	}
	
	private RiakNode createNode(String address, int port)
			throws UnknownHostException {
		return new RiakNode.Builder()
        .withRemoteAddress(address)
        .withRemotePort(port)
        .build();
	}
	
	private RiakCluster createCluster(List<RiakNode> nodes) throws UnknownHostException{
		RiakCluster cluster = new RiakCluster.Builder(nodes).build();
		cluster.start();
		return cluster;
	}

}
