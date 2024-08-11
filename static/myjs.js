$(document).ready(function () {
  var question_pk = document.getElementById("que_pk").value;
  ongoing = false;
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/c_cpp");
  editor.getSession().setTabSize(5);

  $("#lang_select").change(function () {
    selected_lang = $("#lang_select").val();
    console.log(selected_lang);
    if (selected_lang == "CPP14" || selected_lang == "C") {
      editor.getSession().setMode("ace/mode/c_cpp");
    } else {
      editor.getSession().setMode("ace/mode/" + selected_lang.toLowerCase());
    }
  });
  $("#theme_select").change(function () {
    selected_theme = $("#theme_select").val();
    if (selected_theme == "Light") {
      editor.setTheme("ace/theme/dawn");
    } else if (selected_theme == "Monokai") {
      editor.setTheme("ace/theme/monokai");
    } else if (selected_theme == "Solarised Light") {
      editor.setTheme("ace/theme/solarized_light");
    } else if (selected_theme == "Twilight") {
      editor.setTheme("ace/theme/twilight");
    }
  });

  ace.require("ace/ext/language_tools");
  editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
  });

  // form submit
function runCode() {
  if (ongoing == true) return;
  ongoing = true;
  $("#submit_code").prop("disabled", true);
  $("#test_code").prop("disabled", true);

  const codeValue = editor.getValue();
  const inputValue = document.getElementById("Input_").value;
  const langValue = $("#lang_select").val();
  const csrfToken = $("input[name='csrfmiddlewaretoken']").val();

  console.log(codeValue, inputValue, langValue, csrfToken);  // Debugging

  $.ajax({
    type: "POST",
    url: "/run_code",
    data: {
      code_: codeValue,
      Input: inputValue,
      lang: langValue,
      csrfmiddlewaretoken: csrfToken,
    },
    dataType: "json",  // Should be outside the data object
    success: function (response) {
      console.log(response);

      if (response.run_status.status == 'AC') {
        $("#test_output").html(response.run_status.output_html);
        $("#test_output_div").show();
        $("#compilation_error_div").hide();
      } else {
        $("#compilation_error_alert_message").html(response.run_status.output_html);
        $("#compilation_error_div").show();
        $("#test_output_div").hide();
      }

      $("#test_code").prop("disabled", false);
      $("#submit_code").prop("disabled", false);
      ongoing = false;
    },
    error: function (xhr, status, error) {
      console.log(xhr.responseJSON.run_status.output_html);
      $("#compilation_error_alert_message").html(xhr.responseJSON.run_status.output_html);
      $("#compilation_error_div").show();
      $("#test_output_div").hide();
      $("#test_code").prop("disabled", false);
      $("#submit_code").prop("disabled", false);
      ongoing = false;
    }
  });
}


  function SubmitCode() {
    if (ongoing == true) return;
    ongoing = true;
    $("#submit_code").prop("disabled", true);
    $("#test_code").prop("disabled", true);

    $.ajax({
      type: "POST",
      url: "/submit_code/" + question_pk,
      data: {
        code_: editor.getValue(),
        lang: $("#lang_select").val(),
        dataType: "json",
        csrfmiddlewaretoken: $(":input[name='token']").val(),
      },
      success: function (response) {
        if (response.message == "Test Cases Passed") {
          document.getElementById("test_output_div").style.display = "none";
          document.getElementById("compilation_error_div").style.display = "none";
          document.getElementById("compilation_error_alert").style.display = "none";
          document.getElementById("test_output_div").style.display = "none";
          document.getElementById("submit_div").style.display = "block";
          document.getElementById("message").innerHTML = response.message;
        } else if (response.message == "Compilation Error") {
          console.log(response.message);
          document.getElementById("test_output_div").style.display = "none";
          document.getElementById("submit_div").style.display = "none";
          document.getElementById("alert").style.display = "none";
          document.getElementById("compilation_error_div").style.display = "block";
          document.getElementById("compilation_error_alert").style.display = "block";
          document.getElementById("compilation_error_alert_message").innerHTML = response.message;
        } else {
          console.log(response.message);
          document.getElementById("test_output_div").style.display = "none";
          document.getElementById("submit_div").style.display = "none";
          document.getElementById("alert").style.display = "none";
          document.getElementById("compilation_error_div").style.display = "block";
          document.getElementById("compilation_error_alert").style.display = "block";
          document.getElementById("compilation_error_alert_message").innerHTML = response.message;
        }

        console.log(response);
        $("#test_code").prop("disabled", false);
        $("#submit_code").prop("disabled", false);
        ongoing = false;
      },
      error: function (xhr, status, error) {
        console.log(xhr.responseJSON.message);
        document.getElementById("test_output_div").style.display = "none";
        document.getElementById("submit_div").style.display = "none";
        document.getElementById("alert").style.display = "none";
        document.getElementById("compilation_error_div").style.display = "block";
        document.getElementById("compilation_error_alert").style.display = "block";
        document.getElementById("compilation_error_alert_message").innerHTML = xhr.responseJSON.message;
        $("#test_code").prop("disabled", false);
        $("#submit_code").prop("disabled", false);
        ongoing = false;
      }
    });
  }

  $("#submit_code").click(function () {
    SubmitCode();
    console.log("submitting code...");
  });

  $("#test_code").click(function () {
    runCode();
    console.log("running code...");
  });
});