<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">Bot behaviour</h1>
        <div class="text-body-2 grey--text text--darken-1">
          Your bot's name, tone, business facts and rules.
        </div>
      </div>
      <v-spacer />
      <v-chip
        v-if="loaded"
        small
        label
        :color="`${statusChip.color} lighten-5`"
        :text-color="statusTextColor"
        class="font-weight-bold mb-2"
      >
        <v-icon left size="14">{{ statusChip.icon }}</v-icon>
        {{ statusChip.text }}
      </v-chip>
    </div>

    <ThingsToKnow feature="bot-profile" />

    <!-- LOADING / ERROR -->
    <v-alert v-if="!loaded && loadError" type="error" text rounded="lg" class="text-body-2">
      <div class="d-flex align-center flex-wrap">
        <span class="mr-4">{{ loadError }}</span>
        <v-spacer />
        <v-btn small outlined color="error" @click="load">
          <v-icon left size="14">$refresh-cw</v-icon>
          Retry
        </v-btn>
      </div>
    </v-alert>

    <template v-else-if="!loaded">
      <v-card outlined rounded="lg" class="pa-4 mb-4">
        <v-skeleton-loader type="list-item-two-line" />
      </v-card>
      <v-card outlined rounded="lg" class="pa-4">
        <v-skeleton-loader type="heading, list-item-two-line, list-item-two-line, list-item-two-line" />
      </v-card>
    </template>

    <template v-else>
      <!-- ============ DRAFT BAR ============ -->
      <v-card outlined rounded="lg" class="draft-bar mb-4">
        <div class="d-flex flex-wrap align-center px-4 py-3">
          <div class="d-flex align-center mr-4 my-1">
            <v-avatar size="32" :color="`${statusChip.color} lighten-5`" class="mr-3 flex-shrink-0">
              <v-icon size="16" :color="statusTextColor">{{ statusChip.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-body-2 font-weight-bold grey--text text--darken-4">
                <template v-if="dirty">Unsaved changes</template>
                <template v-else-if="hasUnpublishedChanges">Draft saved</template>
                <template v-else-if="publishedVersion">Live</template>
                <template v-else>Not published</template>
              </div>
              <div class="text-caption grey--text text--darken-1">
                <template v-if="dirty">The sandbox tests your saved draft, so save before testing.</template>
                <template v-else-if="hasUnpublishedChanges">
                  Test it in the sandbox, then publish it to go live.
                </template>
                <template v-else-if="publishedVersion">
                  Live chats use version {{ publishedVersion }}, published
                  {{ formatDate(publishedAt) }}.
                </template>
                <template v-else>Save a draft, test it, then publish.</template>
              </div>
            </div>
          </div>
          <v-spacer />
          <div class="d-flex flex-wrap align-center">
            <v-btn v-if="dirty" small text color="grey darken-2" class="my-1" :disabled="saving" @click="discard">
              Discard
            </v-btn>
            <v-btn
              small
              outlined
              color="primary"
              class="ml-2 my-1"
              :disabled="!dirty"
              :loading="saving"
              @click="save"
            >
              <v-icon left size="14">$check</v-icon>
              Save draft
            </v-btn>
            <v-btn small text color="primary" class="ml-2 my-1" to="/dashboard/sandbox">
              <v-icon left size="14">$flask-conical</v-icon>
              Test in sandbox
            </v-btn>
            <v-btn
              small
              depressed
              color="primary"
              class="font-weight-bold ml-2 my-1"
              :disabled="dirty || !hasUnpublishedChanges"
              :loading="publishing"
              @click="publish"
            >
              <v-icon left size="14">$rocket</v-icon>
              Publish
            </v-btn>
          </div>
        </div>

        <v-alert
          v-if="actionError"
          type="error"
          dense
          text
          rounded="lg"
          class="mx-4 mb-3 text-body-2"
        >
          <div class="d-flex align-center flex-wrap">
            <span class="mr-4">{{ actionError }}</span>
            <v-spacer />
            <v-btn v-if="conflict" small outlined color="error" @click="load">Reload</v-btn>
          </div>
        </v-alert>
      </v-card>

      <!-- ============ TABS ============ -->
      <v-tabs
        class="mb-4"
        v-model="tab"
        color="primary"
        background-color="transparent"
        show-arrows
        slider-size="3"
        height="44"
      >
        <v-tab v-for="t in TABS" :key="t.id" :tab-value="t.id" class="text-body-2 font-weight-bold">
          <v-icon size="16" class="mr-2">{{ t.icon }}</v-icon>
          {{ t.label }}
        </v-tab>
      </v-tabs>

      <!-- ============ IDENTITY ============ -->
      <v-card v-show="tab === 'identity'" outlined rounded="lg">
        <div class="px-5 py-4">
          <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4">Identity</div>
          <div class="text-body-2 grey--text text--darken-1">Who the bot is and how it sounds.</div>
        </div>
        <v-divider />
        <v-row dense class="pa-5">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.identity.botName"
              label="Bot name"
              placeholder="e.g. Aria"
              outlined
              dense
              :counter="LINE_MAX"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.identity.companyName"
              label="Company name"
              hint="Leave empty to use the company name on your account."
              persistent-hint
              outlined
              dense
              :counter="LINE_MAX"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select v-model="form.identity.role" :items="ROLES" label="What the bot does" outlined dense />
          </v-col>
          <v-col cols="12" md="6">
            <v-select v-model="form.identity.tone" :items="TONES" label="Tone" outlined dense />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.identity.greeting"
              label="Greeting"
              hint='What the bot says when someone says "hi". Leave empty for the default.'
              persistent-hint
              outlined
              rows="2"
              auto-grow
              :counter="LINE_MAX"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select v-model="form.identity.emoji" :items="EMOJI" label="Emoji" outlined dense />
          </v-col>
          <v-col cols="12" md="6">
            <v-combobox
              v-model="form.identity.languages"
              label="Languages"
              hint="Type a language and press Enter, e.g. English, Hindi."
              persistent-hint
              multiple
              small-chips
              deletable-chips
              outlined
              dense
            />
          </v-col>
          <v-col cols="12">
            <v-sheet outlined rounded="lg" class="d-flex align-center px-4 py-2">
              <div class="flex-grow-1 mr-4">
                <div class="text-body-2 font-weight-bold grey--text text--darken-4">
                  Reply in the customer's language
                </div>
                <div class="text-caption grey--text text--darken-1">
                  The bot answers in whatever language the customer writes in.
                </div>
              </div>
              <v-switch
                v-model="form.identity.replyInCustomerLanguage"
                inset
                hide-details
                color="primary"
                class="mt-0 pt-0"
                aria-label="Reply in the customer's language"
              />
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>

      <!-- ============ BUSINESS FACTS ============ -->
      <div v-show="tab === 'facts'">
        <v-alert text dense color="primary" rounded="lg" class="text-body-2 py-3">
          <template #prepend>
            <v-icon color="primary" size="18" class="mr-3">$info</v-icon>
          </template>
          <span class="grey--text text--darken-3">
            These facts override anything the bot learned from your website. If your site says one
            thing and this page says another, the bot uses this page.
          </span>
        </v-alert>

        <!-- Opening hours -->
        <v-card outlined rounded="lg" class="mb-4">
          <div class="d-flex align-center px-5 py-4">
            <v-icon size="18" color="grey darken-2" class="mr-2">$clock</v-icon>
            <span class="text-subtitle-1 font-weight-bold grey--text text--darken-4">Opening hours</span>
          </div>
          <v-divider />
          <div class="pa-5">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-if="timezones.length"
                  v-model="form.facts.timezone"
                  :items="timezones"
                  label="Timezone"
                  outlined
                  dense
                  clearable
                />
                <v-text-field
                  v-else
                  v-model="form.facts.timezone"
                  label="Timezone"
                  placeholder="Asia/Kolkata"
                  outlined
                  dense
                />
              </v-col>
            </v-row>

            <template v-for="(day, i) in DAYS">
              <v-divider v-if="i > 0" :key="`d-${day.id}`" />
              <v-row :key="day.id" dense align="center" class="py-1">
                <v-col cols="12" sm="2">
                  <span class="text-body-2 font-weight-bold grey--text text--darken-3">{{ day.label }}</span>
                </v-col>
                <v-col cols="12" sm="auto">
                  <v-btn-toggle v-model="form.facts.hours[day.id].mode" dense color="primary">
                    <v-btn small value="">Not set</v-btn>
                    <v-btn small value="open">Open</v-btn>
                    <v-btn small value="closed">Closed</v-btn>
                  </v-btn-toggle>
                </v-col>
                <template v-if="form.facts.hours[day.id].mode === 'open'">
                  <v-col cols="5" sm="3" md="2">
                    <v-text-field
                      v-model="form.facts.hours[day.id].open"
                      type="time"
                      outlined
                      dense
                      hide-details
                      :aria-label="`${day.label} opening time`"
                    />
                  </v-col>
                  <v-col cols="2" sm="auto" class="text-center">
                    <span class="text-body-2 grey--text">to</span>
                  </v-col>
                  <v-col cols="5" sm="3" md="2">
                    <v-text-field
                      v-model="form.facts.hours[day.id].close"
                      type="time"
                      outlined
                      dense
                      hide-details
                      :aria-label="`${day.label} closing time`"
                    />
                  </v-col>
                </template>
              </v-row>
            </template>
          </div>
        </v-card>

        <!-- Contact -->
        <v-card outlined rounded="lg" class="mb-4">
          <div class="d-flex align-center px-5 py-4">
            <v-icon size="18" color="grey darken-2" class="mr-2">$phone</v-icon>
            <span class="text-subtitle-1 font-weight-bold grey--text text--darken-4">Contact</span>
          </div>
          <v-divider />
          <v-row dense class="pa-5">
            <v-col cols="12" md="4">
              <v-text-field v-model="form.facts.contact.phone" label="Phone" outlined dense />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.facts.contact.email" label="Email" outlined dense />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.facts.contact.website"
                label="Website"
                placeholder="https://"
                outlined
                dense
              />
            </v-col>
          </v-row>
        </v-card>

        <!-- Lists -->
        <v-card v-for="list in FACT_LISTS" :key="list.key" outlined rounded="lg" class="mb-4">
          <div class="d-flex flex-wrap align-center px-5 py-4">
            <div class="mr-4">
              <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4">
                {{ list.title }}
                <span class="text-body-2 grey--text">({{ form.facts[list.key].length }})</span>
              </div>
              <div class="text-body-2 grey--text text--darken-1">{{ list.help }}</div>
            </div>
            <v-spacer />
            <v-btn
              small
              outlined
              color="primary"
              class="my-1"
              :disabled="form.facts[list.key].length >= LIST_MAX"
              @click="addRow(list)"
            >
              <v-icon left size="14">$plus</v-icon>
              Add
            </v-btn>
          </div>
          <v-divider />

          <div class="pa-5">
            <div v-if="!form.facts[list.key].length" class="text-center text-body-2 grey--text py-4">
              None added yet.
            </div>
            <v-sheet
              v-for="(row, i) in form.facts[list.key]"
              :key="i"
              outlined
              rounded="lg"
              class="d-flex align-start pl-4 pr-2 pt-4 pb-1 mb-3"
            >
              <v-row dense>
                <v-col v-for="field in list.fields" :key="field.key" cols="12" :md="field.md">
                  <v-textarea
                    v-if="field.textarea"
                    v-model="row[field.key]"
                    :label="field.label"
                    :counter="field.max"
                    rows="3"
                    auto-grow
                    outlined
                    dense
                  />
                  <v-text-field
                    v-else
                    v-model="row[field.key]"
                    :label="field.label"
                    :placeholder="field.placeholder"
                    :counter="field.max"
                    outlined
                    dense
                  />
                </v-col>
              </v-row>
              <v-btn
                icon
                small
                color="error"
                class="ml-2"
                :aria-label="`Remove ${list.title.toLowerCase()} row`"
                @click="form.facts[list.key].splice(i, 1)"
              >
                <v-icon size="16">$trash-2</v-icon>
              </v-btn>
            </v-sheet>
          </div>
        </v-card>
      </div>

      <!-- ============ RULES ============ -->
      <v-card v-show="tab === 'rules'" outlined rounded="lg">
        <div class="px-5 py-4">
          <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4">Rules</div>
          <div class="text-body-2 grey--text text--darken-1">
            One rule per line. Up to {{ LIST_MAX }} lines each, {{ LINE_MAX }} characters per line.
          </div>
        </div>
        <v-divider />
        <div class="pa-5">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="form.rules.do"
                label="Always"
                placeholder="Mention free delivery on orders over ₹999"
                outlined
                rows="5"
                auto-grow
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="form.rules.dont"
                label="Never"
                placeholder="Promise delivery dates"
                outlined
                rows="5"
                auto-grow
              />
            </v-col>
            <v-col cols="12">
              <v-combobox
                v-model="form.rules.refuseTopics"
                label="Topics to refuse"
                hint="The bot politely declines these. Type a topic and press Enter."
                persistent-hint
                multiple
                small-chips
                deletable-chips
                outlined
                dense
              />
            </v-col>
          </v-row>

          <v-divider class="my-5" />

          <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">Prices</div>
          <div class="text-body-2 grey--text text--darken-1 mb-3">
            Where the bot may take prices from when it quotes one.
          </div>
          <v-radio-group v-model="form.rules.pricing" class="mt-0" hide-details>
            <v-sheet
              v-for="p in PRICING"
              :key="p.value"
              outlined
              rounded="lg"
              class="px-4 py-3 mb-2"
            >
              <v-radio :value="p.value" class="mb-0">
                <template #label>
                  <div>
                    <div class="text-body-2 font-weight-bold grey--text text--darken-4">{{ p.text }}</div>
                    <div class="text-caption grey--text text--darken-1">{{ p.help }}</div>
                  </div>
                </template>
              </v-radio>
            </v-sheet>
          </v-radio-group>

          <v-divider class="my-5" />

          <v-textarea
            v-model="form.rules.disclaimers"
            label="Disclaimers"
            hint="Added to answers where they apply, one per line."
            persistent-hint
            outlined
            rows="3"
            auto-grow
          />
        </div>
      </v-card>

      <!-- ============ ESCALATION ============ -->
      <v-card v-show="tab === 'escalation'" outlined rounded="lg">
        <div class="px-5 py-4">
          <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4">Escalation</div>
          <div class="text-body-2 grey--text text--darken-1">
            When the bot hands a chat to your team.
          </div>
        </div>
        <v-divider />
        <div class="pa-5">
          <v-combobox
            v-model="form.rules.escalation.keywords"
            label="Escalation keywords"
            hint='A message with any of these always goes to a person, e.g. "refund", "complaint", "talk to a human".'
            persistent-hint
            multiple
            small-chips
            deletable-chips
            outlined
            dense
            class="mb-6"
          />

          <v-row dense>
            <v-col cols="12" md="8">
              <div class="d-flex align-center mb-1">
                <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
                  Confidence threshold
                </span>
                <v-spacer />
                <v-chip small label color="primary lighten-5" text-color="primary" class="font-weight-bold">
                  {{ form.rules.escalation.confidenceThreshold.toFixed(2) }}
                </v-chip>
              </div>
              <div class="text-body-2 grey--text text--darken-1 mb-2">
                When the bot is less sure than this, it hands the chat to your team instead of
                answering. Higher means more handoffs. The default is {{ DEFAULT_THRESHOLD }}.
              </div>
              <v-slider
                v-model="form.rules.escalation.confidenceThreshold"
                min="0"
                max="1"
                step="0.05"
                thumb-label
                hide-details
                color="primary"
              />
            </v-col>
          </v-row>

          <v-btn small outlined color="primary" class="mt-5" to="/dashboard/integration?section=webhooks">
            <v-icon left size="14">$webhook</v-icon>
            Set where escalations are sent
          </v-btn>
        </div>
      </v-card>

      <!-- ============ CONVERSATION ============ -->
      <v-card v-show="tab === 'conversation'" outlined rounded="lg">
        <div class="px-5 py-4">
          <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4">Conversation</div>
          <div class="text-body-2 grey--text text--darken-1">
            Holding messages, when conversations end, reply limits and the handoff message.
          </div>
        </div>
        <v-divider />
        <div class="pa-5">
          <v-sheet outlined rounded="lg" class="pa-4 mb-5">
            <div class="d-flex align-start">
              <div class="flex-grow-1 mr-4">
                <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
                  Send a message when an answer takes a while
                </div>
                <div class="text-body-2 grey--text text--darken-1">
                  If an answer takes longer than this, the customer gets a short message first, then
                  the answer. Only in live website and WhatsApp chats, not the sandbox.
                </div>
              </div>
              <v-switch
                v-model="form.conversation.holdingEnabled"
                color="primary"
                inset
                hide-details
                class="mt-0 pt-0 flex-shrink-0"
                :label="form.conversation.holdingEnabled ? 'On' : 'Off'"
              />
            </div>
            <template v-if="form.conversation.holdingEnabled">
              <v-divider class="my-4" />
              <v-radio-group v-model="form.conversation.holdingMode" class="mt-0 mb-2" hide-details>
                <v-radio v-for="m in MESSAGE_MODES" :key="m.value" :value="m.value" class="mb-2">
                  <template #label>
                    <div>
                      <div class="text-body-2 font-weight-bold grey--text text--darken-4">{{ m.text }}</div>
                      <div class="text-caption grey--text text--darken-1">{{ m.help }}</div>
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>
              <v-row dense class="mt-2">
                <v-col v-if="form.conversation.holdingMode === 'fixed'" cols="12" sm="9">
                  <v-text-field
                    v-model="form.conversation.holdingText"
                    label="Message"
                    outlined
                    dense
                    :counter="LINE_MAX"
                  />
                </v-col>
                <v-col cols="12" sm="3">
                  <v-text-field
                    v-model="form.conversation.holdingSeconds"
                    label="After (seconds)"
                    type="number"
                    min="3"
                    max="30"
                    outlined
                    dense
                    :rules="[intRule(3, 30)]"
                  />
                </v-col>
              </v-row>
            </template>
          </v-sheet>

          <v-sheet outlined rounded="lg" class="pa-4 mb-5">
            <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
              When a conversation ends
            </div>
            <div class="text-body-2 grey--text text--darken-1 mb-4">
              End a conversation after this long without messages. The next message starts a new
              conversation, and the bot starts fresh (it doesn't carry over the earlier messages).
            </div>
            <v-row dense>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="form.conversation.idleWeb"
                  label="Website"
                  suffix="minutes"
                  type="number"
                  min="5"
                  max="1440"
                  outlined
                  dense
                  :rules="[intRule(5, 1440)]"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="form.conversation.idleWhatsappHours"
                  label="WhatsApp"
                  suffix="hours"
                  type="number"
                  min="0.5"
                  max="168"
                  step="0.5"
                  outlined
                  dense
                  :rules="[hoursRule]"
                />
              </v-col>
            </v-row>
          </v-sheet>

          <v-sheet outlined rounded="lg" class="pa-4 mb-5">
            <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
              AI replies per chat per day before handing off
            </div>
            <div class="text-body-2 grey--text text--darken-1 mb-4">
              After this many AI replies in one chat within 24 hours, the bot stops and sends the
              handoff message.
            </div>
            <v-row dense>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="form.conversation.limitWeb"
                  label="Website"
                  type="number"
                  min="1"
                  max="500"
                  outlined
                  dense
                  :rules="[intRule(1, 500)]"
                />
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="form.conversation.limitWhatsapp"
                  label="WhatsApp"
                  type="number"
                  min="1"
                  max="500"
                  outlined
                  dense
                  :rules="[intRule(1, 500)]"
                />
              </v-col>
            </v-row>
          </v-sheet>

          <v-sheet outlined rounded="lg" class="pa-4">
            <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4 mb-1">
              Handoff message
            </div>
            <v-radio-group v-model="form.conversation.handoffMode" class="mt-2 mb-2" hide-details>
              <v-radio v-for="m in MESSAGE_MODES" :key="m.value" :value="m.value" class="mb-2">
                <template #label>
                  <div>
                    <div class="text-body-2 font-weight-bold grey--text text--darken-4">{{ m.text }}</div>
                    <div class="text-caption grey--text text--darken-1">{{ m.help }}</div>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
            <v-text-field
              v-if="form.conversation.handoffMode === 'fixed'"
              v-model="form.conversation.handoffMessage"
              label="Message"
              :hint="`Used on both the website and WhatsApp. Clear it to use each channel's default; WhatsApp's is &quot;${defaultHandoff.whatsapp}&quot;`"
              persistent-hint
              outlined
              dense
              class="mt-2"
              :counter="LINE_MAX"
            />
          </v-sheet>
        </div>
      </v-card>

      <!-- ============ ADVANCED ============ -->
      <v-card v-show="tab === 'advanced'" outlined rounded="lg">
        <div class="px-5 py-4">
          <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4">Custom instructions</div>
          <div class="text-body-2 grey--text text--darken-1">
            Anything the other sections don't cover. Write it as plain instructions to the bot.
          </div>
        </div>
        <v-divider />
        <div class="pa-5">
          <v-textarea
            v-model="form.customInstructions"
            label="Custom instructions"
            outlined
            rows="10"
            auto-grow
            :counter="CUSTOM_MAX"
          />
        </div>
      </v-card>

      <!-- ============ HISTORY ============ -->
      <v-card v-show="tab === 'history'" outlined rounded="lg">
        <div class="px-5 py-4">
          <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4">History</div>
          <div class="text-body-2 grey--text text--darken-1">
            Your last 20 published versions. Restoring one publishes it again right away and replaces
            your draft with it.
          </div>
        </div>
        <v-divider />

        <div v-if="historyLoading" class="pa-4">
          <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line" />
        </div>
        <v-alert v-else-if="historyError" type="error" text rounded="lg" class="ma-5 text-body-2">
          <div class="d-flex align-center flex-wrap">
            <span class="mr-4">{{ historyError }}</span>
            <v-spacer />
            <v-btn small outlined color="error" @click="loadHistory">Retry</v-btn>
          </div>
        </v-alert>
        <div v-else-if="!history.length" class="d-flex flex-column align-center text-center py-10">
          <v-avatar color="grey lighten-4" size="56" class="mb-3">
            <v-icon size="24" color="grey">$history</v-icon>
          </v-avatar>
          <div class="text-body-2 font-weight-bold grey--text text--darken-3">
            Nothing has been published yet.
          </div>
        </div>
        <div v-else>
          <template v-for="(item, i) in history">
            <v-divider v-if="i > 0" :key="`d-${item.version}`" />
            <div :key="item.version" class="d-flex flex-wrap align-center px-5 py-3">
              <v-avatar
                size="36"
                tile
                class="rounded-lg mr-4 flex-shrink-0"
                :color="item.live ? 'green lighten-5' : 'grey lighten-4'"
              >
                <span class="text-caption font-weight-bold" :class="item.live ? 'success--text' : 'grey--text text--darken-2'">
                  v{{ item.version }}
                </span>
              </v-avatar>
              <div class="flex-grow-1 mr-4 my-1">
                <div class="d-flex align-center text-body-2 font-weight-bold grey--text text--darken-4">
                  Version {{ item.version }}
                  <v-chip v-if="item.live" x-small label color="success" class="font-weight-bold ml-2">
                    Live
                  </v-chip>
                </div>
                <div class="text-caption grey--text text--darken-1">
                  {{ formatDate(item.publishedAt) }} · {{ personName(item.publishedBy) }}
                </div>
              </div>
              <div class="d-flex my-1">
                <v-btn small text color="grey darken-2" @click="viewing = item">
                  <v-icon left size="14">$eye</v-icon>
                  View
                </v-btn>
                <v-btn small outlined color="primary" class="ml-2" :disabled="item.live" @click="restoring = item">
                  <v-icon left size="14">$rotate-ccw</v-icon>
                  Restore
                </v-btn>
              </div>
            </div>
          </template>
        </div>
      </v-card>
    </template>

    <!-- VIEW VERSION -->
    <v-dialog :value="!!viewing" max-width="720" scrollable @input="viewing = null">
      <v-card v-if="viewing" rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">Version {{ viewing.version }}</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-sheet color="grey lighten-5" rounded="lg" class="pa-4">
            <pre class="text-caption text-pre-wrap text-break">{{ JSON.stringify(viewing.content, null, 2) }}</pre>
          </v-sheet>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-6 py-3">
          <v-spacer />
          <v-btn text @click="viewing = null">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- RESTORE -->
    <v-dialog :value="!!restoring" max-width="440" @input="restoring = null">
      <v-card v-if="restoring" rounded="lg">
        <v-card-text class="pt-6 text-center">
          <v-avatar color="primary lighten-5" size="56" class="mb-4">
            <v-icon color="primary" size="26">$rotate-ccw</v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold grey--text text--darken-4 mb-2">
            Restore version {{ restoring.version }}?
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            This publishes version {{ restoring.version }} again, so live chats start using it right
            away.
          </div>
          <v-alert
            v-if="dirty || hasUnpublishedChanges"
            text
            dense
            color="amber darken-3"
            rounded="lg"
            class="text-body-2 text-left mt-4 mb-0"
          >
            Your current draft, including changes you haven't published, will be replaced.
          </v-alert>
        </v-card-text>
        <v-card-actions class="justify-center pb-5">
          <v-btn text :disabled="rollingBack" @click="restoring = null">Cancel</v-btn>
          <v-btn color="primary" depressed :loading="rollingBack" @click="rollback">
            Restore and publish
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import ThingsToKnow from "@/components/ThingsToKnow.vue";

const ENDPOINT = "/clients/bot-profile";

// Backend limits
const LIST_MAX = 30;
const LINE_MAX = 300;
const POLICY_MAX = 2000;
const CUSTOM_MAX = 10000;
const DEFAULT_THRESHOLD = 0.6;
const DEFAULT_TIMEZONE = "Asia/Kolkata";
// Fallback for data.defaults.conversation, which GET bot-profile returns
const CONVERSATION_DEFAULTS = {
  holdingMessage: {
    enabled: true,
    mode: "auto",
    text: "Let me check that for you, one moment please.",
    afterSeconds: 6,
  },
  aiReplyLimit: { web: 20, whatsapp: 10 },
  idleMinutes: { web: 60, whatsapp: 1440 },
  handoffMode: "auto",
  handoffMessage: {
    web: "I will connect you with our support team shortly.",
    whatsapp: "I will assign this to available chat support. They will help you shortly.",
  },
};

const MESSAGE_MODES = [
  {
    value: "auto",
    text: "Written by the bot (Auto, recommended)",
    help: "The bot writes this message for each customer, in their language. If that fails, the fixed text is used.",
  },
  {
    value: "fixed",
    text: "Fixed text",
    help: "Customers get exactly the text you write.",
  },
];

const TABS = [
  { id: "identity", label: "Identity", icon: "$user" },
  { id: "facts", label: "Business facts", icon: "$store" },
  { id: "rules", label: "Rules", icon: "$list-checks" },
  { id: "escalation", label: "Escalation", icon: "$headset" },
  { id: "conversation", label: "Conversation", icon: "$message-square-text" },
  { id: "advanced", label: "Advanced", icon: "$braces" },
  { id: "history", label: "History", icon: "$history" },
];

const ROLES = [
  { value: "support_sales", text: "Support and sales" },
  { value: "support", text: "Support only" },
  { value: "information", text: "Information only" },
];

const TONES = [
  { value: "friendly", text: "Friendly" },
  { value: "formal", text: "Formal" },
  { value: "concise", text: "Concise" },
];

// v-select can't hold null reliably, so emoji maps to strings here.
const EMOJI = [
  { value: "auto", text: "Let the bot decide" },
  { value: "on", text: "Use emoji" },
  { value: "off", text: "No emoji" },
];

const PRICING = [
  {
    value: "auto",
    text: "Automatic (recommended)",
    help: "Live product data when a product API is connected, otherwise prices written in your knowledge.",
  },
  {
    value: "live_only",
    text: "Live product data only",
    help: "Never quote prices from your knowledge.",
  },
  {
    value: "knowledge",
    text: "From knowledge",
    help: "Quote prices exactly as written in your FAQs, notes and pages.",
  },
];

const DAYS = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
];

const FACT_LISTS = [
  {
    key: "locations",
    title: "Locations",
    help: "Stores, offices, or branches customers can visit.",
    fields: [
      { key: "name", label: "Name", md: 4, max: LINE_MAX },
      { key: "address", label: "Address", md: 5, max: LINE_MAX },
      { key: "mapUrl", label: "Map link", md: 3, placeholder: "https://", max: LINE_MAX },
    ],
  },
  {
    key: "links",
    title: "Links",
    help: "Pages the bot can share, like booking, pricing, or a menu.",
    fields: [
      { key: "label", label: "Label", md: 4, max: LINE_MAX },
      { key: "url", label: "URL", md: 8, placeholder: "https://", max: LINE_MAX },
    ],
  },
  {
    key: "policies",
    title: "Policies",
    help: "Refunds, cancellations, warranty, delivery, and so on.",
    fields: [
      { key: "title", label: "Title", md: 12, max: LINE_MAX },
      { key: "text", label: "Policy", md: 12, textarea: true, max: POLICY_MAX },
    ],
  },
];

const str = (v) => (typeof v === "string" ? v : "");
const arr = (v) => (Array.isArray(v) ? v : []);
const lines = (text) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
const clean = (list) => arr(list).map((s) => String(s).trim()).filter(Boolean);

// API profile → editable form. Lists of sentences become one-per-line text,
// and hours become one entry per weekday.
// Empty conversation fields are filled with the defaults, so every field shows
// its real value.
function toForm(profile = {}, defaults = CONVERSATION_DEFAULTS) {
  const identity = profile.identity || {};
  const facts = profile.facts || {};
  const rules = profile.rules || {};
  const escalation = rules.escalation || {};
  const conversation = profile.conversation || {};
  const holding = conversation.holdingMessage || {};
  const limit = conversation.aiReplyLimit || {};
  const idle = conversation.idleMinutes || {};
  const dIdle = defaults.idleMinutes || CONVERSATION_DEFAULTS.idleMinutes;
  const waMinutes = typeof idle.whatsapp === "number" ? idle.whatsapp : dIdle.whatsapp;
  const dHolding = defaults.holdingMessage || CONVERSATION_DEFAULTS.holdingMessage;
  const dLimit = defaults.aiReplyLimit || CONVERSATION_DEFAULTS.aiReplyLimit;
  const dHandoff = defaults.handoffMessage || CONVERSATION_DEFAULTS.handoffMessage;
  const numStr = (v, d) => String(typeof v === "number" ? v : d ?? "");
  const mode = (v, d) => (v === "fixed" || v === "auto" ? v : d || "auto");

  const hours = {};
  DAYS.forEach(({ id }) => {
    const h = arr(facts.hours).find((x) => x.day === id);
    hours[id] = {
      mode: h ? (h.closed ? "closed" : "open") : "",
      open: str(h?.open) || "09:00",
      close: str(h?.close) || "18:00",
    };
  });

  const rows = (list, keys) =>
    arr(list).map((r) => Object.fromEntries(keys.map((k) => [k, str(r?.[k])])));

  return {
    identity: {
      botName: str(identity.botName),
      companyName: str(identity.companyName),
      role: identity.role || "support_sales",
      tone: identity.tone || "friendly",
      greeting: str(identity.greeting),
      emoji: identity.emoji === true ? "on" : identity.emoji === false ? "off" : "auto",
      languages: arr(identity.languages),
      replyInCustomerLanguage: !!identity.replyInCustomerLanguage,
    },
    facts: {
      timezone: str(facts.timezone) || DEFAULT_TIMEZONE,
      hours,
      locations: rows(facts.locations, ["name", "address", "mapUrl"]),
      contact: {
        phone: str(facts.contact?.phone),
        email: str(facts.contact?.email),
        website: str(facts.contact?.website),
      },
      links: rows(facts.links, ["label", "url"]),
      policies: rows(facts.policies, ["title", "text"]),
    },
    rules: {
      do: arr(rules.do).join("\n"),
      dont: arr(rules.dont).join("\n"),
      refuseTopics: arr(rules.refuseTopics),
      disclaimers: arr(rules.disclaimers).join("\n"),
      pricing: PRICING.some((p) => p.value === rules.pricing) ? rules.pricing : "auto",
      escalation: {
        keywords: arr(escalation.keywords),
        confidenceThreshold:
          typeof escalation.confidenceThreshold === "number"
            ? escalation.confidenceThreshold
            : DEFAULT_THRESHOLD,
      },
    },
    conversation: {
      holdingEnabled: holding.enabled !== false,
      holdingMode: mode(holding.mode, dHolding.mode),
      holdingText: str(holding.text) || str(dHolding.text),
      holdingSeconds: numStr(holding.afterSeconds, dHolding.afterSeconds),
      limitWeb: numStr(limit.web, dLimit.web),
      limitWhatsapp: numStr(limit.whatsapp, dLimit.whatsapp),
      idleWeb: numStr(idle.web, dIdle.web),
      // Shown in hours, stored in minutes
      idleWhatsappHours: typeof waMinutes === "number" ? String(+(waMinutes / 60).toFixed(2)) : "",
      handoffMode: mode(conversation.handoffMode, defaults.handoffMode),
      handoffMessage: str(conversation.handoffMessage) || str(dHandoff.web),
    },
    customInstructions: str(profile.customInstructions),
  };
}

// Editable form → API profile. Blank lines and empty rows are dropped.
function toProfile(form) {
  const trimRow = (row) =>
    Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v.trim()]));
  const rows = (list) =>
    list.map(trimRow).filter((r) => Object.values(r).some(Boolean));

  return {
    identity: {
      ...form.identity,
      botName: form.identity.botName.trim(),
      companyName: form.identity.companyName.trim(),
      greeting: form.identity.greeting.trim(),
      emoji: { on: true, off: false }[form.identity.emoji] ?? null,
      languages: clean(form.identity.languages),
    },
    facts: {
      timezone: (form.facts.timezone || "").trim(),
      hours: DAYS.filter(({ id }) => form.facts.hours[id].mode).map(({ id }) => {
        const h = form.facts.hours[id];
        return h.mode === "closed"
          ? { day: id, closed: true }
          : { day: id, open: h.open, close: h.close, closed: false };
      }),
      locations: rows(form.facts.locations),
      contact: trimRow(form.facts.contact),
      links: rows(form.facts.links),
      policies: rows(form.facts.policies),
    },
    rules: {
      do: lines(form.rules.do),
      dont: lines(form.rules.dont),
      refuseTopics: clean(form.rules.refuseTopics),
      disclaimers: lines(form.rules.disclaimers),
      pricing: form.rules.pricing,
      escalation: {
        keywords: clean(form.rules.escalation.keywords),
        confidenceThreshold: form.rules.escalation.confidenceThreshold,
      },
    },
    // Empty fields go as null, which means "use the default"
    conversation: {
      holdingMessage: {
        enabled: form.conversation.holdingEnabled,
        mode: form.conversation.holdingMode,
        text: form.conversation.holdingText.trim() || null,
        afterSeconds: toInt(form.conversation.holdingSeconds),
      },
      aiReplyLimit: {
        web: toInt(form.conversation.limitWeb),
        whatsapp: toInt(form.conversation.limitWhatsapp),
      },
      handoffMode: form.conversation.handoffMode,
      handoffMessage: form.conversation.handoffMessage.trim() || null,
      idleMinutes: {
        web: toInt(form.conversation.idleWeb),
        whatsapp: hoursToMinutes(form.conversation.idleWhatsappHours),
      },
    },
    customInstructions: form.customInstructions.trim(),
  };
}

// WhatsApp idle time: hours in the form, whole minutes in the profile
function hoursToMinutes(value) {
  const s = String(value ?? "").trim();
  return s === "" ? null : Math.round(Number(s) * 60);
}

// "" → null; anything else goes as a number so the backend can reject
// fractions with its own message.
function toInt(value) {
  const s = String(value ?? "").trim();
  return s === "" ? null : Number(s);
}

function supportedTimezones() {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return [];
  }
}

export default {
  name: "BotProfile",

  components: { ThingsToKnow },

  data() {
    return {
      TABS,
      ROLES,
      TONES,
      EMOJI,
      PRICING,
      DAYS,
      FACT_LISTS,
      LIST_MAX,
      LINE_MAX,
      CUSTOM_MAX,
      DEFAULT_THRESHOLD,
      MESSAGE_MODES,
      defaults: CONVERSATION_DEFAULTS,
      timezones: supportedTimezones(),

      tab: "identity",

      loaded: false,
      loadError: "",
      form: toForm(),
      savedJson: JSON.stringify(toProfile(toForm())),
      version: 0,
      publishedVersion: null,
      publishedAt: null,
      hasUnpublishedChanges: false,

      saving: false,
      publishing: false,
      actionError: "",
      conflict: false,

      history: [],
      historyLoaded: false,
      historyLoading: false,
      historyError: "",
      viewing: null,
      restoring: null,
      rollingBack: false,
    };
  },

  computed: {
    dirty() {
      return JSON.stringify(toProfile(this.form)) !== this.savedJson;
    },

    defaultHandoff() {
      return this.defaults.handoffMessage || CONVERSATION_DEFAULTS.handoffMessage;
    },

    // Readable text/icon colour for the status chip on its light background
    statusTextColor() {
      const map = { warning: "amber darken-3", success: "success", grey: "grey darken-2" };
      return map[this.statusChip.color] || "grey darken-2";
    },
    statusChip() {
      if (this.dirty || this.hasUnpublishedChanges) {
        return { text: "Draft: unpublished changes", color: "warning", icon: "$pencil" };
      }
      if (this.publishedVersion) {
        return { text: `Live: version ${this.publishedVersion}`, color: "success", icon: "$circle-check" };
      }
      return { text: "Not published", color: "grey", icon: "$circle" };
    },
  },

  watch: {
    tab(tab) {
      if (tab === "history" && !this.historyLoaded) this.loadHistory();
    },
  },

  created() {
    this.load();
    window.addEventListener("beforeunload", this.onBeforeUnload);
  },

  beforeDestroy() {
    window.removeEventListener("beforeunload", this.onBeforeUnload);
  },

  beforeRouteLeave(to, from, next) {
    if (this.dirty && !window.confirm("You have unsaved changes. Leave without saving?")) {
      next(false);
      return;
    }
    next();
  },

  methods: {
    intRule(min, max) {
      return (v) => {
        const s = String(v ?? "").trim();
        if (s === "") return true;
        const n = Number(s);
        return (Number.isInteger(n) && n >= min && n <= max) || `A whole number from ${min} to ${max}`;
      };
    },

    // 30 minutes to 7 days
    hoursRule(v) {
      const s = String(v ?? "").trim();
      if (s === "") return true;
      const m = Math.round(Number(s) * 60);
      return (Number.isFinite(m) && m >= 30 && m <= 10080) || "From 0.5 to 168 hours";
    },

    apply(data) {
      this.defaults = data?.defaults?.conversation || CONVERSATION_DEFAULTS;
      this.form = toForm(data?.draft || {}, this.defaults);
      this.savedJson = JSON.stringify(toProfile(this.form));
      this.version = data?.version || 0;
      this.publishedVersion = data?.publishedVersion || null;
      this.publishedAt = data?.publishedAt || null;
      this.hasUnpublishedChanges = !!data?.hasUnpublishedChanges;
    },

    setError(err, fallback) {
      this.conflict = err.response?.status === 409;
      this.actionError = err.response?.data?.message || fallback;
    },

    async load() {
      this.loadError = "";
      this.actionError = "";
      this.conflict = false;
      try {
        const { data } = await apiClient.get(ENDPOINT);
        this.apply(data.data);
        this.loaded = true;
      } catch (err) {
        this.loadError = err.response?.data?.message || "Failed to load the bot profile";
      }
    },

    discard() {
      this.form = toForm(JSON.parse(this.savedJson), this.defaults);
      this.actionError = "";
    },

    addRow(list) {
      this.form.facts[list.key].push(
        Object.fromEntries(list.fields.map((f) => [f.key, ""]))
      );
    },

    async save() {
      this.saving = true;
      this.actionError = "";
      try {
        const { data } = await apiClient.put(ENDPOINT, {
          profile: toProfile(this.form),
          version: this.version,
        });
        this.apply(data.data);
        this.$toast.success("Draft saved");
      } catch (err) {
        this.setError(err, "Failed to save the draft");
      } finally {
        this.saving = false;
      }
    },

    async publish() {
      this.publishing = true;
      this.actionError = "";
      try {
        await apiClient.post(`${ENDPOINT}/publish`, { version: this.version });
        await this.load();
        this.historyLoaded = false;
        this.$toast.success("Published. Live chats now use this profile.");
      } catch (err) {
        this.setError(err, "Failed to publish");
      } finally {
        this.publishing = false;
      }
    },

    async loadHistory() {
      this.historyLoading = true;
      this.historyError = "";
      try {
        const { data } = await apiClient.get(`${ENDPOINT}/history`);
        this.history = arr(data.data);
        this.historyLoaded = true;
      } catch (err) {
        this.historyError = err.response?.data?.message || "Failed to load history";
      } finally {
        this.historyLoading = false;
      }
    },

    async rollback() {
      const { version } = this.restoring;
      this.rollingBack = true;
      try {
        await apiClient.post(`${ENDPOINT}/rollback`, { version });
        this.restoring = null;
        await Promise.all([this.load(), this.loadHistory()]);
        this.$toast.success(`Version ${version} restored and published`);
      } catch (err) {
        this.$toast.error(err.response?.data?.message || "Failed to restore");
      } finally {
        this.rollingBack = false;
      }
    },

    onBeforeUnload(e) {
      if (!this.dirty) return;
      e.preventDefault();
      e.returnValue = "";
    },

    formatDate(value) {
      return value
        ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
        : "";
    },

    // null: the account owner, a service token, or the migration
    personName(p) {
      return p?.name || p?.email || "Owner or system";
    },
  },
};
</script>

<style scoped>
/* Keeps Save and Publish in reach while scrolling (64px top bar + gap) */
.draft-bar {
  position: sticky;
  top: 72px;
  z-index: 3;
}
</style>
