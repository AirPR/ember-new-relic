import Ember from "ember";
import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";
import { visit } from "@ember/test-helpers";

module("Acceptance | new relic browser", function(hooks) {
  setupApplicationTest(hooks);

  test("Loading New Relic Browser", async function(assert) {
    await visit("/");

    var newRelic = window.NREUM;

    assert.expect(9);

    assert.ok(
      newRelic,
      "The New Relic object (NREUM) should be added to the window"
    );

    assert.ok(
      typeof newRelic.noticeError === "function",
      "New Relic Browser should be loaded"
    );

    /* Now our errors are tracking, let's check they are
  caught by the extra Ember events like onerror */

    window.NREUM.noticeError = function(error) {
      assert.ok(true, "noticeError should be called by Ember.onerror");

      assert.ok(
        error instanceof Error,
        "noticeError should receive an error object"
      );

      assert.ok(
        error.name !== "TransitionAborted",
        "noticeError should not be called by Ember.onerror on TransitionAborted errors."
      );
    };

    assert.throws(() => {
      Ember.onerror(new Error("Awh crap"));
    }, "Awh crap");

    const transitionError = new Error("Ember Transition Aborted Test");
    transitionError.name = "TransitionAborted";
    Ember.onerror(transitionError);

    Ember.Logger.error("Whoops", "We done messed up", {});
  });

  test("console.error from Ember.Logger.error correctly shows messages", async function(assert) {
    await visit("/");

    // eslint-disable-next-line no-console
    console.error = function(message) {
      assert.strictEqual(
        message.toString(),
        "Error: Whoops We done messed up",
        "Shows messages space-separated"
      );
    };

    Ember.Logger.error("Whoops", "We done messed up");
  });
});
