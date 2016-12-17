package jp.ryans.factory.codecamp.java.servlet.gae;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;

public class ContactJson {

	public enum JsonTag {
		STATUS("status"),
		MESSAGE("message"),
		ERRORS("errors"),
		ERROR_PARAMETER("parameter"),
		ERROR_MESSAGE("error_message"),
		RESULTS_SUCCESS("success"),
		RESULTS_ERROR("error");

		private String name;

		JsonTag(String name) {
			this.name = name;
		}

		public String getName() {
			return this.name;
		}
	}

	JSONObject wrap = null;

	public ContactJson() {
		wrap = new JSONObject();
	}

	public void setSuccess() throws JSONException {
		setStatuse(JsonTag.RESULTS_SUCCESS.getName());
	}

	public void setError() throws JSONException {
		setStatuse(JsonTag.RESULTS_ERROR.getName());
	}

	public void setStatuse(String status) throws JSONException {
		wrap.put(JsonTag.STATUS.getName(), status);
	}

	public void setMessage(String message) throws JSONException {
		wrap.put(JsonTag.MESSAGE.getName(), message);
	}

	public void setErrorMessage(Map<String, String> error) throws JSONException {

		JSONObject err = new JSONObject();
		for (String key : error.keySet()) {
			if (!key.equals(JsonTag.MESSAGE.getName())) {
				err.put(key, error.get(key));
			}
		}
		setError();
		wrap.put(JsonTag.ERRORS.getName(), err);
	}

	@Override
	public String toString() {
		return wrap.toString();
	}

	public void writeContent(HttpServletResponse resp, String code) throws IOException {
		byte[] b = wrap.toString().getBytes(code);
		resp.setContentLength(b.length);
		resp.getWriter().print(wrap.toString());
	}
}