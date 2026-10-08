<template>
  <div>
    <v-btn
      text
      small
      color="grey darken-2"
      class="mb-3 px-2"
      to="/dashboard/knowledge"
    >
      <v-icon left size="16">$arrow-left</v-icon>
      All sources
    </v-btn>

    <!-- LOADING / ERROR -->
    <v-alert
      v-if="!source && loadError"
      type="error"
      text
      rounded="lg"
      class="text-body-2"
    >
      <div class="d-flex align-center flex-wrap">
        <span class="mr-4">{{ loadError }}</span>
        <v-spacer />
        <v-btn small outlined color="error" @click="loadSource">
          <v-icon left size="14">$refresh-cw</v-icon>
          Retry
        </v-btn>
      </div>
    </v-alert>

    <template v-else-if="!source">
      <v-card outlined rounded="lg" class="pa-4 mb-4">
        <v-skeleton-loader type="list-item-avatar-two-line" />
      </v-card>
      <v-card outlined rounded="lg" class="pa-4">
        <v-skeleton-loader type="table-heading, table-tbody" />
      </v-card>
    </template>

    <template v-else>
      <!-- HEADER -->
      <v-card outlined rounded="lg" class="mb-4">
        <div class="d-flex flex-wrap align-start pa-5">
          <v-avatar
            size="48"
            tile
            class="rounded-lg mr-4 mb-2 flex-shrink-0"
            :color="`${type.color} lighten-5`"
          >
            <v-icon :color="type.color" size="24">{{ type.icon }}</v-icon>
          </v-avatar>

          <div class="flex-grow-1 mr-4 mb-2 overflow-hidden">
            <div class="d-flex flex-wrap align-center">
              <h1
                class="text-h6 font-weight-bold grey--text text--darken-4 text-break mr-2"
              >
                {{ source.name }}
              </h1>
              <v-chip
                v-for="chip in stateChips"
                :key="chip.label"
                x-small
                label
                :outlined="chip.outlined"
                :color="chip.color"
                :text-color="chip.outlined ? undefined : 'white'"
                class="font-weight-bold mr-1 my-1"
              >
                {{ chip.label }}
              </v-chip>
            </div>
            <div class="text-body-2 grey--text text--darken-1 text-break">
              {{ type.label }}
              <template v-if="source.config && source.config.rootUrl">
                · {{ source.config.rootUrl }}
              </template>
            </div>
          </div>

          <div class="d-flex flex-wrap align-center mb-2">
            <v-btn
              v-if="can(perms, 'knowledge:publish')"
              small
              outlined
              color="grey darken-2"
              class="mr-2 my-1"
              :loading="sourceBusy === 'pause'"
              @click="togglePause"
            >
              <v-icon left size="14">{{ paused ? "$play" : "$pause" }}</v-icon>
              {{ paused ? "Resume" : "Pause" }}
            </v-btn>
            <v-btn
              v-if="can(perms, 'knowledge:write')"
              small
              outlined
              color="grey darken-2"
              class="mr-2 my-1"
              @click="openSettings"
            >
              <v-icon left size="14">$pencil</v-icon>
              Settings
            </v-btn>
            <v-btn
              v-if="can(perms, 'knowledge:delete')"
              small
              outlined
              color="error"
              class="my-1"
              @click="confirmDelete = true"
            >
              <v-icon left size="14">$trash-2</v-icon>
              Delete
            </v-btn>
          </div>
        </div>

        <v-divider />

        <v-row no-gutters>
          <v-col v-for="(s, i) in headerStats" :key="s.label" cols="4">
            <div class="d-flex">
              <v-divider v-if="i > 0" vertical />
              <div class="flex-grow-1 px-5 py-3">
                <div class="text-h6 font-weight-bold grey--text text--darken-4">
                  {{ s.value }}
                </div>
                <div class="text-caption grey--text text--darken-1">
                  {{ s.label }}
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-progress-linear
          :value="publishedPercent"
          color="success"
          background-color="grey lighten-3"
          height="4"
          :aria-label="`${publishedPercent}% published`"
        />
      </v-card>

      <!-- STATE NOTES -->
      <v-alert
        v-if="source.stage === 'staging'"
        text
        dense
        color="deep-orange"
        rounded="lg"
        class="text-body-2 py-3"
      >
        <template #prepend>
          <v-icon color="deep-orange" size="18" class="mr-3"
            >$flask-conical</v-icon
          >
        </template>
        <span class="grey--text text--darken-3">
          Part of your new setup: built and tested, but customers can't see it
          until you switch over in
          <router-link to="/dashboard/setup">Setup</router-link>.
        </span>
      </v-alert>
      <v-alert
        v-else-if="source.retiring"
        text
        dense
        color="blue-grey"
        rounded="lg"
        class="text-body-2 py-3"
      >
        <template #prepend>
          <v-icon color="blue-grey" size="18" class="mr-3">$info</v-icon>
        </template>
        <span class="grey--text text--darken-3">
          Still answering customers, but your new setup replaces it: switching
          over deletes this source.
        </span>
      </v-alert>
      <v-alert
        v-if="paused"
        text
        dense
        color="amber darken-3"
        rounded="lg"
        class="text-body-2 py-3"
      >
        <template #prepend>
          <v-icon color="amber darken-3" size="18" class="mr-3">$pause</v-icon>
        </template>
        <div class="d-flex align-center flex-wrap">
          <span class="grey--text text--darken-3 mr-4">
            This source is paused, so the bot doesn't use any of it. Nothing has
            been deleted.
          </span>
          <v-spacer />
          <v-btn
            v-if="can(perms, 'knowledge:publish')"
            small
            depressed
            color="amber darken-3"
            class="white--text my-1"
            :loading="sourceBusy === 'pause'"
            @click="togglePause"
          >
            <v-icon left size="14">$play</v-icon>
            Resume
          </v-btn>
        </div>
      </v-alert>

      <ThingsToKnow v-if="faqSource" feature="faqs" />

      <ImportPanel
        v-if="source.type === 'website' && can(perms, 'knowledge:write')"
        :source-id="source._id"
        @imported="onImported"
      />

      <DocumentStatusCard
        v-if="source.type === 'document'"
        :source="source"
        :can-write="can(perms, 'knowledge:write')"
        :can-publish="can(perms, 'knowledge:publish')"
        @changed="refresh()"
      />

      <FaqExtractPanel
        v-if="source.type === 'faq'"
        v-model="extractOpen"
        :source="source"
        @update="(s) => (source = { ...source, ...s })"
        @progress="loadItems({ quiet: true })"
        @finished="refresh()"
      />

      <!-- ITEMS -->
      <v-card outlined rounded="lg">
        <div class="d-flex flex-wrap align-center px-5 pt-4 pb-2">
          <div class="mr-4 my-1">
            <span
              class="text-subtitle-1 font-weight-bold grey--text text--darken-4"
            >
              {{ itemNoun }}
            </span>
            <span class="text-body-2 grey--text text--darken-1 ml-1"
              >({{ total }})</span
            >
          </div>
          <v-spacer />
          <template v-if="can(perms, 'knowledge:write')">
            <template v-if="source.type === 'faq'">
              <v-btn
                small
                text
                color="grey darken-2"
                class="my-1"
                @click="extractOpen = true"
              >
                <v-icon left size="14">$wand-sparkles</v-icon>
                Suggest from website
              </v-btn>
              <v-btn
                small
                text
                color="grey darken-2"
                class="my-1"
                @click="faqImportOpen = true"
              >
                <v-icon left size="14">$file-spreadsheet</v-icon>
                Import CSV
              </v-btn>
            </template>
            <v-btn
              v-if="faqSource"
              small
              depressed
              color="primary"
              class="ml-2 my-1"
              @click="faqOpen = true"
            >
              <v-icon left size="14">$plus</v-icon>
              Add FAQ
            </v-btn>
            <v-btn
              v-else-if="source.type !== 'website'"
              small
              depressed
              color="primary"
              class="ml-2 my-1"
              @click="openNote()"
            >
              <v-icon left size="14">$plus</v-icon>
              Add note
            </v-btn>
          </template>
        </div>

        <!-- Filters -->
        <v-row dense align="center" class="px-4 pb-3">
          <v-col cols="12" lg="auto" class="overflow-x-auto">
            <v-btn-toggle
              v-model="statusFilter"
              mandatory
              dense
              color="primary"
            >
              <v-btn v-for="f in FILTERS" :key="f.value" :value="f.value" small>
                {{ f.label }}
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-spacer />
          <v-col
            cols="12"
            :sm="faqSource && knownCategories.length ? 6 : 12"
            lg="3"
          >
            <v-text-field
              v-model="search"
              :placeholder="
                faqSource ? 'Search questions and answers' : 'Search titles'
              "
              outlined
              dense
              hide-details
              clearable
            />
          </v-col>
          <v-col
            v-if="faqSource && knownCategories.length"
            cols="12"
            sm="6"
            lg="3"
          >
            <v-select
              v-model="categoryFilter"
              :items="knownCategories"
              placeholder="All categories"
              outlined
              dense
              hide-details
              clearable
            />
          </v-col>
        </v-row>

        <!-- Bulk actions -->
        <v-expand-transition>
          <v-sheet
            v-if="selected.length"
            color="primary lighten-5"
            rounded="lg"
            class="d-flex align-center flex-wrap mx-4 mb-3 px-3 py-1"
          >
            <v-icon size="16" color="primary" class="mr-2">$check-check</v-icon>
            <span class="text-body-2 font-weight-bold primary--text mr-3">
              {{ selected.length }} selected
            </span>
            <template v-if="can(perms, 'knowledge:publish')">
              <v-btn
                small
                text
                color="primary"
                :loading="bulkBusy === 'publish'"
                @click="bulk('publish')"
              >
                <v-icon left size="14">$circle-check</v-icon>
                {{ allSuggested ? "Approve" : "Publish" }}
              </v-btn>
              <v-btn
                v-if="!allSuggested"
                small
                text
                color="grey darken-2"
                :loading="bulkBusy === 'unpublish'"
                @click="bulk('unpublish')"
              >
                <v-icon left size="14">$eye-off</v-icon>
                Unpublish
              </v-btn>
              <v-btn
                v-if="!allSuggested"
                small
                text
                color="grey darken-2"
                :loading="bulkBusy === 'archive'"
                @click="bulk('archive')"
              >
                <v-icon left size="14">$archive</v-icon>
                Archive
              </v-btn>
            </template>
            <v-btn
              v-if="can(perms, 'knowledge:delete')"
              small
              text
              color="error"
              @click="confirmBulkDelete = true"
            >
              <v-icon left size="14">$trash-2</v-icon>
              {{ allSuggested ? "Reject" : "Delete" }}
            </v-btn>
            <v-spacer />
            <v-btn small text color="grey darken-2" @click="selected = []"
              >Clear</v-btn
            >
          </v-sheet>
        </v-expand-transition>

        <v-divider />

        <v-data-table
          v-model="selected"
          :headers="headers"
          :items="displayItems"
          :options.sync="options"
          :server-items-length="total"
          :loading="itemsLoading"
          :show-select="canBulk"
          :footer-props="{ itemsPerPageOptions: [20, 50, 100] }"
          item-key="_id"
          loading-text="Loading…"
          @click:row="(item) => (openItemId = item._id)"
        >
          <template #[`item.title`]="{ item }">
            <div class="py-3">
              <a
                href="#"
                class="d-inline-flex align-center text-body-2 font-weight-bold grey--text text--darken-4 text-decoration-none text-break"
                @click.prevent
              >
                <v-icon
                  v-if="item.locked"
                  size="12"
                  class="mr-1"
                  title="Edited by hand"
                  >$lock</v-icon
                >
                {{ item.title || "Untitled" }}
              </a>
              <div
                v-if="item.data && item.data.url"
                class="text-caption grey--text text--darken-1 text-break"
              >
                {{ item.data.url }}
              </div>
              <div
                v-else-if="alternatesOf(item)"
                class="text-caption grey--text text--darken-1"
              >
                +{{ alternatesOf(item) }} other way{{
                  alternatesOf(item) === 1 ? "" : "s"
                }}
                to ask
              </div>
            </div>
          </template>
          <template #[`item.category`]="{ item }">
            <v-chip
              v-if="item.data && item.data.category"
              x-small
              label
              outlined
            >
              {{ item.data.category }}
            </v-chip>
          </template>
          <template #[`item.status`]="{ item }">
            <div class="d-flex flex-wrap py-1">
              <v-chip
                v-if="isSuggested(item)"
                x-small
                label
                outlined
                color="deep-purple"
                class="font-weight-bold mr-1 my-1"
              >
                <v-icon size="10" left>$sparkles</v-icon>
                Suggested
              </v-chip>
              <v-chip
                v-else
                x-small
                label
                :color="statusOf(item).color"
                text-color="white"
                class="font-weight-bold mr-1 my-1"
              >
                {{ statusOf(item).label }}
              </v-chip>
              <v-chip
                v-if="healthOf(item)"
                x-small
                label
                outlined
                :color="healthOf(item).color"
                class="font-weight-bold mr-1 my-1"
                :title="
                  item.openIssueCount
                    ? `${item.openIssueCount} open issue(s)`
                    : ''
                "
              >
                <v-icon size="10" left>{{ healthOf(item).icon }}</v-icon>
                {{ healthOf(item).label }}
              </v-chip>
              <v-chip
                v-if="validityOf(item)"
                x-small
                label
                outlined
                :color="validityOf(item).color"
                class="font-weight-bold mr-1 my-1"
                :title="validityTitle(item)"
              >
                <v-icon size="10" left>$calendar</v-icon>
                {{ validityOf(item).label }}
              </v-chip>
              <v-tooltip
                v-if="workOf(item)"
                bottom
                :disabled="!workOf(item).error"
              >
                <template #activator="{ on, attrs }">
                  <v-chip
                    x-small
                    label
                    outlined
                    :color="workOf(item).color"
                    class="font-weight-bold my-1"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon
                      v-if="workOf(item).busy"
                      size="10"
                      left
                      class="icon-spin"
                      >$loader-circle</v-icon
                    >
                    {{ workOf(item).label }}
                  </v-chip>
                </template>
                {{ workOf(item).error }}
              </v-tooltip>
            </div>
          </template>
          <template #[`item.chunkCount`]="{ item }">
            <span class="text-body-2 grey--text text--darken-2">{{
              item.chunkCount || 0
            }}</span>
          </template>
          <template #[`item.review`]="{ item }">
            <div
              v-if="isSuggested(item)"
              class="d-flex justify-end text-no-wrap"
              @click.stop
            >
              <v-btn
                v-if="can(perms, 'knowledge:publish')"
                x-small
                depressed
                color="primary"
                class="mr-1"
                :loading="rowBusy === item._id + 'publish'"
                @click="review(item, 'publish')"
              >
                Approve
              </v-btn>
              <v-btn
                v-if="can(perms, 'knowledge:delete')"
                x-small
                text
                color="error"
                :loading="rowBusy === item._id + 'delete'"
                @click="review(item, 'delete')"
              >
                Reject
              </v-btn>
            </div>
          </template>
          <template #[`item.updatedAt`]="{ item }">
            <span class="text-caption grey--text text--darken-1 text-no-wrap">
              {{ formatDate(item.updatedAt) }}
            </span>
          </template>
          <template #no-data>
            <div class="d-flex flex-column align-center text-center py-10">
              <v-avatar color="grey lighten-4" size="56" class="mb-3">
                <v-icon size="24" color="grey">{{
                  filtering ? "$search" : type.icon
                }}</v-icon>
              </v-avatar>
              <div
                class="text-body-2 font-weight-bold grey--text text--darken-3"
              >
                {{ emptyText }}
              </div>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </template>

    <ItemEditorDrawer
      :item-id="openItemId"
      :permissions="perms"
      :categories="knownCategories"
      @close="openItemId = null"
      @changed="refresh"
      @add-note="addAsNote"
      @open-issue="
        (id) =>
          $router.push({
            path: '/dashboard/knowledge/issues',
            query: { issue: id },
          })
      "
    />

    <template v-if="source && faqSource">
      <FaqDialog
        v-model="faqOpen"
        :source-id="source._id"
        :categories="knownCategories"
        :can-publish="can(perms, 'knowledge:publish')"
        @saved="refresh"
      />
      <FaqImportDialog
        v-model="faqImportOpen"
        :source-id="source._id"
        :can-publish="can(perms, 'knowledge:publish')"
        @imported="refresh"
      />
    </template>

    <!-- ADD NOTE -->
    <v-dialog v-model="noteOpen" max-width="600" scrollable>
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">Add note</v-card-title>
        <v-card-subtitle class="text-body-2">
          Facts that aren't on your website, written the way the bot should
          answer.
        </v-card-subtitle>
        <v-card-text>
          <v-text-field
            v-model="note.title"
            label="Title"
            outlined
            dense
            counter="300"
          />
          <v-textarea
            v-model="note.body"
            label="Text"
            hint="Write it the way you'd want the bot to answer. At least 10 characters."
            persistent-hint
            outlined
            rows="8"
            auto-grow
          />
          <v-checkbox
            v-if="can(perms, 'knowledge:publish')"
            v-model="note.publish"
            hide-details
            label="Publish now, so the bot can use it"
          />
          <v-checkbox
            v-if="note.failedItemId && can(perms, 'knowledge:delete')"
            v-model="note.deleteFailed"
            hide-details
            label="Also delete the page that failed"
          />
          <v-alert
            v-if="noteError"
            type="error"
            dense
            text
            rounded="lg"
            class="mt-4 mb-0 text-body-2"
          >
            {{ noteError }}
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-6 py-3">
          <v-spacer />
          <v-btn text :disabled="noteSaving" @click="noteOpen = false"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            depressed
            :disabled="note.body.trim().length < 10"
            :loading="noteSaving"
            @click="saveNote"
          >
            Add note
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SOURCE SETTINGS -->
    <v-dialog v-model="settingsOpen" max-width="480">
      <v-card v-if="source" rounded="lg">
        <v-card-title class="text-h6 font-weight-bold"
          >Source settings</v-card-title
        >
        <v-card-text class="pt-2">
          <v-text-field
            v-model="settings.name"
            label="Name"
            outlined
            dense
            counter="100"
          />
          <template v-if="source.type === 'website'">
            <v-text-field
              v-model="settings.rootUrl"
              label="Website address"
              placeholder="https://example.com"
              outlined
              dense
            />
            <v-switch
              v-model="settings.autoPublish"
              inset
              hide-details
              class="mt-0"
              label="Publish pages as soon as they're imported"
            />
          </template>
          <v-alert
            v-if="settingsError"
            type="error"
            dense
            text
            rounded="lg"
            class="mt-4 mb-0 text-body-2"
          >
            {{ settingsError }}
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-6 py-3">
          <v-spacer />
          <v-btn
            text
            :disabled="sourceBusy === 'settings'"
            @click="settingsOpen = false"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            depressed
            :disabled="!settings.name.trim()"
            :loading="sourceBusy === 'settings'"
            @click="saveSettings"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE SOURCE -->
    <v-dialog v-model="confirmDelete" max-width="440">
      <v-card v-if="source" rounded="lg">
        <v-card-text class="pt-6 text-center">
          <v-avatar color="error lighten-5" size="56" class="mb-4">
            <v-icon color="error" size="26">$trash-2</v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold grey--text text--darken-4 mb-2">
            Delete "{{ source.name }}"?
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            <template v-if="source.type === 'document'">
              Deletes the document and its
              <strong>{{ stat("itemCount") }}</strong> sections from the bot
              immediately. This can't be undone.
            </template>
            <template v-else>
              This permanently deletes the source and all
              <strong>{{ stat("itemCount") }}</strong>
              of its items. The bot stops using them right away, and this can't
              be undone.
            </template>
            To hide it from the bot for now, pause it instead.
          </div>
        </v-card-text>
        <v-card-actions class="justify-center pb-5">
          <v-btn
            text
            :disabled="sourceBusy === 'delete'"
            @click="confirmDelete = false"
            >Cancel</v-btn
          >
          <v-btn
            color="error"
            depressed
            :loading="sourceBusy === 'delete'"
            @click="deleteSource"
          >
            Delete source
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- BULK DELETE -->
    <v-dialog v-model="confirmBulkDelete" max-width="440">
      <v-card rounded="lg">
        <v-card-text class="pt-6 text-center">
          <v-avatar color="error lighten-5" size="56" class="mb-4">
            <v-icon color="error" size="26">$trash-2</v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold grey--text text--darken-4 mb-2">
            {{ bulkDeleteTitle }}
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            {{ bulkDeleteText }}
          </div>
        </v-card-text>
        <v-card-actions class="justify-center pb-5">
          <v-btn
            text
            :disabled="bulkBusy === 'delete'"
            @click="confirmBulkDelete = false"
            >Cancel</v-btn
          >
          <v-btn
            color="error"
            depressed
            :loading="bulkBusy === 'delete'"
            @click="bulk('delete')"
          >
            {{ allSuggested ? "Reject" : "Delete" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import FaqDialog from "@/components/knowledge/FaqDialog.vue";
import FaqExtractPanel from "@/components/knowledge/FaqExtractPanel.vue";
import FaqImportDialog from "@/components/knowledge/FaqImportDialog.vue";
import ImportPanel from "@/components/knowledge/ImportPanel.vue";
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import ItemEditorDrawer from "@/components/knowledge/ItemEditorDrawer.vue";
import DocumentStatusCard from "@/components/knowledge/DocumentStatusCard.vue";
import {
  ITEM_STATUS,
  KNOWLEDGE_API,
  apiError,
  can,
  formatDate,
  healthOf,
  isBusy,
  isFaqSource,
  isSuggested,
  loadMyPermissions,
  sourceType,
  validityOf,
  workState,
} from "@/utils/knowledge";

const POLL_MS = 3000;

const FILTERS = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "needs_review", label: "Needs review" },
  { value: "archived", label: "Archived" },
];

const BULK_DONE = {
  publish: "published",
  unpublish: "unpublished",
  archive: "archived",
  delete: "deleted",
};

const emptyNote = () => ({
  title: "",
  body: "",
  publish: true,
  failedItemId: null,
  deleteFailed: false,
});

export default {
  name: "KnowledgeSource",

  components: {
    FaqDialog,
    FaqExtractPanel,
    FaqImportDialog,
    ImportPanel,
    ItemEditorDrawer,
    ThingsToKnow,
    DocumentStatusCard,
  },

  data() {
    return {
      FILTERS,
      perms: [],

      source: null,
      loadError: "",
      sourceBusy: null,

      items: [],
      total: 0,
      itemsLoading: false,
      options: { page: 1, itemsPerPage: 20 },
      statusFilter: "",
      categoryFilter: null,
      knownCategories: [],
      search: "",
      searchTimer: null,
      pollTimer: null,

      selected: [],
      bulkBusy: null,
      confirmBulkDelete: false,

      openItemId: null,
      rowBusy: null,

      faqOpen: false,
      faqImportOpen: false,
      extractOpen: false,

      noteOpen: false,
      note: emptyNote(),
      noteSaving: false,
      noteError: "",

      settingsOpen: false,
      settings: { name: "", rootUrl: "", autoPublish: true },
      settingsError: "",

      confirmDelete: false,
    };
  },

  computed: {
    sourceId() {
      return this.$route.params.sourceId;
    },
    type() {
      return sourceType(this.source?.type);
    },
    paused() {
      return this.source?.status === "paused";
    },
    faqSource() {
      return isFaqSource(this.source);
    },
    // Document sections in document order (within the page)
    displayItems() {
      if (this.source?.type !== "document") return this.items;
      const order = (i) =>
        typeof i.data?.order === "number" ? i.data.order : Infinity;
      return [...this.items].sort((a, b) => order(a) - order(b));
    },
    allSuggested() {
      return this.selected.length > 0 && this.selected.every(isSuggested);
    },
    itemNoun() {
      if (this.source?.type === "website") return "Pages";
      if (this.source?.type === "document") return "Sections";
      return this.faqSource ? "FAQs" : "Notes";
    },
    filtering() {
      return !!(this.search || this.statusFilter || this.categoryFilter);
    },
    emptyText() {
      if (this.filtering) return "No items match these filters.";
      if (this.source?.type === "website")
        return "No pages yet. Import some above.";
      if (this.source?.type === "document") {
        return "No sections yet. They appear once the document has been read.";
      }
      return this.faqSource ? "No FAQs yet." : "No notes yet.";
    },
    headerStats() {
      return [
        { label: "Items", value: this.stat("itemCount") },
        { label: "Published", value: this.stat("publishedCount") },
        { label: "Chunks", value: this.stat("chunkCount") },
      ];
    },
    publishedPercent() {
      const total = this.stat("itemCount");
      return total
        ? Math.round((this.stat("publishedCount") / total) * 100)
        : 0;
    },
    // Live / paused / staging / being replaced
    stateChips() {
      const chips = [];
      if (this.paused) chips.push({ label: "Paused", color: "amber darken-3" });
      if (this.source?.stage === "staging")
        chips.push({ label: "Staging", color: "deep-orange" });
      if (!chips.length) chips.push({ label: "Live", color: "success" });
      if (this.source?.retiring) {
        chips.push({
          label: "Being replaced",
          color: "grey darken-1",
          outlined: true,
        });
      }
      return chips;
    },
    bulkDeleteTitle() {
      const n = this.selected.length;
      return this.allSuggested
        ? `Reject ${n} suggestions?`
        : `Delete ${n} items?`;
    },
    bulkDeleteText() {
      return this.allSuggested
        ? "The suggested FAQs are deleted. The bot never used them."
        : "The bot stops using them right away. This can't be undone.";
    },
    canBulk() {
      return (
        can(this.perms, "knowledge:publish") ||
        can(this.perms, "knowledge:delete")
      );
    },
    headers() {
      if (this.faqSource) {
        return [
          { text: "Question", value: "title", sortable: false },
          { text: "Category", value: "category", sortable: false },
          { text: "Status", value: "status", sortable: false },
          { text: "", value: "review", sortable: false, align: "end" },
          { text: "Updated", value: "updatedAt", sortable: false },
        ];
      }
      return [
        {
          text: this.source?.type === "document" ? "Section" : "Title",
          value: "title",
          sortable: false,
        },
        { text: "Status", value: "status", sortable: false },
        { text: "Chunks", value: "chunkCount", sortable: false, align: "end" },
        { text: "Updated", value: "updatedAt", sortable: false },
      ];
    },
  },

  watch: {
    options: {
      handler() {
        this.loadItems();
      },
      deep: true,
    },
    statusFilter() {
      this.resetPage();
    },
    categoryFilter() {
      this.resetPage();
    },
    search() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(this.resetPage, 350);
    },
    // The same component is reused when moving to another source
    sourceId(id, old) {
      if (!id || id === old) return;
      this.source = null;
      this.items = [];
      this.total = 0;
      this.openItemId = null;
      this.statusFilter = "";
      this.categoryFilter = null;
      this.knownCategories = [];
      this.search = "";
      this.loadSource();
      this.resetPage();
    },
  },

  created() {
    this.loadSource();
    loadMyPermissions()
      .then((p) => (this.perms = p))
      .catch(() => {});
  },

  beforeDestroy() {
    clearTimeout(this.pollTimer);
    clearTimeout(this.searchTimer);
  },

  methods: {
    alternatesOf(item) {
      return (item.type === "faq" && item.data?.alternates?.length) || 0;
    },

    can,
    formatDate,
    isSuggested,
    healthOf,
    validityOf,
    validityTitle: (item) =>
      validityOf(item)?.expired
        ? "Hidden from the bot: its valid-until date has passed"
        : "",
    statusOf: (item) => ITEM_STATUS[item.status] || ITEM_STATUS.draft,
    workOf: (item) => workState(item),

    stat(key) {
      return this.source?.stats?.[key] ?? 0;
    },

    async loadSource() {
      this.loadError = "";
      try {
        const { data } = await apiClient.get(
          `${KNOWLEDGE_API}/sources/${this.sourceId}`,
        );
        this.source = data.data;
        // Arrived from "Add as note instead" on a failed page
        const { note, failed } = this.$route.query;
        if (note !== undefined) {
          this.$router.replace({ query: {} }).catch(() => {});
          if (this.source.type !== "website")
            this.openNote(String(note), failed || null);
        }
      } catch (err) {
        this.loadError = apiError(err, "Failed to load this source");
      }
    },

    resetPage() {
      this.selected = [];
      if (this.options.page !== 1) this.options = { ...this.options, page: 1 };
      else this.loadItems();
    },

    async loadItems({ quiet = false } = {}) {
      clearTimeout(this.pollTimer);
      if (!quiet) this.itemsLoading = true;
      const { page, itemsPerPage } = this.options;
      try {
        const { data } = await apiClient.get(
          `${KNOWLEDGE_API}/sources/${this.sourceId}/items`,
          {
            params: {
              status: this.statusFilter || undefined,
              search: this.search || undefined,
              category: this.categoryFilter || undefined,
              limit: itemsPerPage,
              offset: (page - 1) * itemsPerPage,
            },
          },
        );
        this.items = data.data.items || [];
        this.total = data.data.total || 0;
        // Categories seen so far feed the filter and the FAQ editors
        const seen = new Set(this.knownCategories);
        this.items.forEach(
          (i) => i.data?.category && seen.add(i.data.category),
        );
        this.knownCategories = [...seen].sort((a, b) => a.localeCompare(b));
        // Keep selections that are still on the page, with fresh data
        const ids = new Set(this.selected.map((s) => s._id));
        this.selected = this.items.filter((i) => ids.has(i._id));
      } catch (err) {
        if (!quiet) this.$toast.error(apiError(err, "Failed to load items"));
      } finally {
        this.itemsLoading = false;
      }
      // Imports and indexing finish in the background
      if (this.items.some(isBusy)) {
        this.pollTimer = setTimeout(
          () => this.refresh({ quiet: true }),
          POLL_MS,
        );
      }
    },

    refresh({ quiet = false } = {}) {
      this.loadItems({ quiet });
      this.loadSource();
    },

    onImported() {
      if (this.statusFilter) this.statusFilter = "";
      else this.refresh();
    },

    async togglePause() {
      const pause = !this.paused;
      this.sourceBusy = "pause";
      try {
        await apiClient.post(
          `${KNOWLEDGE_API}/sources/${this.sourceId}/${
            pause ? "pause" : "resume"
          }`,
        );
        this.source.status = pause ? "paused" : "active";
        this.$toast.success(
          pause ? "Paused. The bot no longer uses this source." : "Resumed",
        );
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to update the source"));
      } finally {
        this.sourceBusy = null;
      }
    },

    openSettings() {
      this.settings = {
        name: this.source.name,
        rootUrl: this.source.config?.rootUrl || "",
        autoPublish: this.source.config?.autoPublish !== false,
      };
      this.settingsError = "";
      this.settingsOpen = true;
    },

    async saveSettings() {
      this.sourceBusy = "settings";
      this.settingsError = "";
      const body = { name: this.settings.name.trim() };
      if (this.source.type === "website") {
        body.config = {
          rootUrl: this.settings.rootUrl.trim(),
          autoPublish: this.settings.autoPublish,
        };
      }
      try {
        const { data } = await apiClient.patch(
          `${KNOWLEDGE_API}/sources/${this.sourceId}`,
          body,
        );
        this.source = { ...this.source, ...data.data };
        this.settingsOpen = false;
        this.$toast.success("Saved");
      } catch (err) {
        this.settingsError = apiError(err, "Failed to save");
      } finally {
        this.sourceBusy = null;
      }
    },

    async deleteSource() {
      this.sourceBusy = "delete";
      try {
        const { data } = await apiClient.delete(
          `${KNOWLEDGE_API}/sources/${this.sourceId}`,
        );
        this.$toast.success(
          `Deleted "${this.source.name}" and ${data.data?.items ?? 0} items`,
        );
        this.$router.push("/dashboard/knowledge");
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to delete the source"));
        this.sourceBusy = null;
      }
    },

    // failedItemId: the page this note replaces ("Add as note instead")
    openNote(title = "", failedItemId = null) {
      this.note = {
        ...emptyNote(),
        title,
        failedItemId,
        deleteFailed: !!failedItemId,
      };
      this.note.publish = can(this.perms, "knowledge:publish");
      this.noteError = "";
      this.noteOpen = true;
    },

    // A page that can't be imported (blocked, too little text...) becomes a
    // note in a manual source, created if the client has none yet.
    async addAsNote({ title, failedItemId }) {
      this.openItemId = null;
      if (this.source.type === "manual") {
        this.openNote(title, failedItemId);
        return;
      }
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/sources`);
        let target = (data.data || []).find((s) => s.type === "manual");
        if (!target) {
          const created = await apiClient.post(`${KNOWLEDGE_API}/sources`, {
            type: "manual",
            name: "Notes",
          });
          target = created.data.data;
        }
        this.$router.push({
          path: `/dashboard/knowledge/${target._id}`,
          query: { note: title, failed: failedItemId },
        });
      } catch (err) {
        this.$toast.error(apiError(err, "Couldn't open a notes source"));
      }
    },

    async saveNote() {
      this.noteSaving = true;
      this.noteError = "";
      try {
        await apiClient.post(
          `${KNOWLEDGE_API}/sources/${this.sourceId}/items`,
          {
            title: this.note.title.trim() || undefined,
            body: this.note.body.trim(),
            publish: this.note.publish,
          },
        );
        this.noteOpen = false;
        this.$toast.success(
          this.note.publish
            ? "Note added and publishing"
            : "Note added as a draft",
        );
        // Only once the note is saved; if this fails the page simply stays
        if (
          this.note.failedItemId &&
          this.note.deleteFailed &&
          can(this.perms, "knowledge:delete")
        ) {
          try {
            await apiClient.delete(
              `${KNOWLEDGE_API}/items/${this.note.failedItemId}`,
            );
            this.$toast.success("Deleted the page that failed");
          } catch (err) {
            this.$toast.error(
              apiError(
                err,
                "The note was added, but the failed page couldn't be deleted",
              ),
            );
          }
        }
        this.refresh();
      } catch (err) {
        this.noteError = apiError(err, "Failed to add the note");
      } finally {
        this.noteSaving = false;
      }
    },

    // Approve (publish) or reject (delete) one suggested FAQ from the table
    async review(item, action) {
      this.rowBusy = item._id + action;
      try {
        if (action === "delete")
          await apiClient.delete(`${KNOWLEDGE_API}/items/${item._id}`);
        else await apiClient.post(`${KNOWLEDGE_API}/items/${item._id}/publish`);
        this.$toast.success(
          action === "delete" ? "Suggestion rejected" : "Approved",
        );
        this.refresh({ quiet: true });
      } catch (err) {
        this.$toast.error(
          apiError(
            err,
            action === "delete" ? "Failed to reject" : "Failed to approve",
          ),
        );
      } finally {
        this.rowBusy = null;
      }
    },

    async bulk(action) {
      this.bulkBusy = action;
      try {
        const { data } = await apiClient.post(`${KNOWLEDGE_API}/items/bulk`, {
          ids: this.selected.map((i) => i._id),
          action,
        });
        const { done = 0, failed = [] } = data.data || {};
        if (failed.length) {
          this.$toast.warning(
            `${done} ${BULK_DONE[action]}, ${failed.length} failed: ${failed[0].error}`,
          );
        } else {
          this.$toast.success(
            `${done} item${done === 1 ? "" : "s"} ${BULK_DONE[action]}`,
          );
        }
        this.confirmBulkDelete = false;
        this.selected = [];
        this.refresh();
      } catch (err) {
        this.$toast.error(apiError(err, "Bulk action failed"));
      } finally {
        this.bulkBusy = null;
      }
    },
  },
};
</script>
