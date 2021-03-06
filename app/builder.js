/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const builder = {};

/**
 * Return all server extension points for Eclipse client template
 * input: 
 *          fileTypes - String[]
 * output:
 *          servers - String[] 
 */
builder.getServerExtensions = function getServerExtensions(fileTypes) {
    let servers = [];
    for (let index = 0; index < fileTypes.length; index++) {
        const element = fileTypes[index];
        servers[index] = `
        <server
            class="org.vutbr.lsp.client.LSPStreamConnectionProvider"
            id="lsp.server.${element}"
            label="LSP Server for ${element}">
        </server>`.trim();
    }
    return servers;
}

/**
 * Return all contentTypeMapping extension points for Eclipse client template
 * input: 
 *          fileTypes - String[]
 *          serverID - String
 * output:
 *          contentTypeMapping - String[] 
 */
builder.getContentTypeMapping = function getContentTypeMapping(fileTypes, serverID) {
    let contentTypeMapping = [];
    for (let index = 0; index < fileTypes.length; index++) {
        let element = fileTypes[index];
        let type;
        if(element === 'xml'){
            type = 'org.eclipse.core.runtime.xml';
        } else {
            type = 'org.eclipse.jdt.core.javaSource';
        }
        contentTypeMapping[index] = `
        <contentTypeMapping
            contentType="${type}"
            id="lsp.server.${element}"
            languageId="${serverID}">
        </contentTypeMapping>`.trim();
    }
    return contentTypeMapping;
}

/**
 * Return all extension points for Eclipse client template
 * input: 
 *          fileTypes - String[]
 *          serverID - String
 * output:
 *          extensionPoints - String[] 
 */
builder.getExtensionPoints = function getExtensionPoints(fileTypes, serverID) {
    let extensionPoints = [];
    
    let server = `
    <extension point="org.eclipse.lsp4e.languageServer">
        ${builder.getContentTypeMapping(fileTypes, serverID).join('\n\t\t')}
        ${builder.getServerExtensions(fileTypes).join('\n\t\t')}
    </extension>`;

    let xmlProposals = `
    <extension point="org.eclipse.wst.sse.ui.completionProposal">
   	    <proposalCategory
            id="org.category"
            name="Completion proposals">
  	    </proposalCategory>
 
  	    <proposalComputer
       	    activate="true"
            categoryId="org.category"
            class="org.vutbr.lsp.xml.completion.XMLCompletionProposalComputer"
            id="org.xml.proposalcomputer">      
      	  <contentType id="org.eclipse.core.runtime.xml"/>      
  	    </proposalComputer> 
    </extension>`;

   let javaProposals = `
    <extension id="idJavaComputer" point="org.eclipse.jdt.ui.javaCompletionProposalComputer">
        <javaCompletionProposalComputer
            activate="true"
            categoryId="org.eclipse.jdt.ui.defaultProposalCategory"
            class="org.vutbr.lsp.java.completion.JavaCompletionProposalComputer"
            needsSortingAfterFiltering="false">
        </javaCompletionProposalComputer>
    </extension>`;

    extensionPoints[0] = server.trim();
    if(fileTypes.includes('xml')) {
        extensionPoints.push(xmlProposals);
    } 
    if(fileTypes.includes('java')) {
        extensionPoints.push(javaProposals);
    }
    return extensionPoints;
}

/**
 * Return all activation events for VS Code client template
 * input: 
 *          fileTypes - String[]
 * output:
 *          activationEvents - String[] 
 */
builder.getActivationEvents = function getActivationEvents(fileTypes) {
    let activationEvents = [];
    for (let index = 0; index < fileTypes.length; index++) {
        activationEvents[index] = `
        "onLanguage:${fileTypes[index]}",
        "workspaceContains:*.${fileTypes[index]}",`;
    }
    // remove last comma - syntax error prevention
    activationEvents[activationEvents.length - 1] = activationEvents[activationEvents.length - 1].replace(/,\s*$/, "");
    return activationEvents;
}

/**
 * Return all contibutes languages for VS Code client template
 * input: 
 *          fileTypes - String[]
 * output:
 *          languages - String[] 
 */
builder.getContributesLanguages = function getContributesLanguages(fileTypes) {
    let languages = [];
    for (let index = 0; index < fileTypes.length; index++) {
        languages[index] = `
          {
            "id": "${fileTypes[index]}",
            "extensions": [
              ".${fileTypes[index]}"
            ],
            "configuration": "./language-configuration.json"
          },`;
    }
    // remove last comma - syntax error prevention
    languages[languages.length - 1] = languages[languages.length - 1].replace(/,\s*$/, "");
    return languages;
}

/**
 * Return all file events for VS Code client template
 * input: 
 *          fileTypes - String[]
 * output:
 *          events - String[] 
 */
builder.getFileEvents = function getFileEvents(fileTypes) {
    let events = [];
    for (let index = 0; index < fileTypes.length; index++) {
        events[index] = `
                workspace.createFileSystemWatcher('**/*.${fileTypes[index]}')`;
    }
    // remove last comma - syntax error prevention
    events[events.length - 1] = events[events.length - 1].replace(/,\s*$/, "");
    return events;
}

/**
 * Return all file types as string array format for VS Code client template
 * input: 
 *          fileTypes - String[]
 * output:
 *          formatArray - String
 */
builder.getFileTypesAsStringArrayFormat = function getFileTypesAsStringArrayFormat(fileTypes) {
    let formatArray = "";
    for (let index = 0; index < fileTypes.length; index++) {
        formatArray += `'${fileTypes[index]}', `;
    }
    // remove last comma - syntax error prevention
    formatArray = formatArray.replace(/,\s*$/, "");
    return formatArray;
}

/**
 * Return all document language ID's for VS Code client template
 * input: 
 *          fileTypes - String[]
 * output:
 *          documentLanguageId - String
 */
builder.getDocumentLanguageId = function getDocumentLanguageId(fileTypes) {
    let documentLanguageId = "";
    for (let index = 0; index < fileTypes.length; index++) {
        documentLanguageId += `editor.document.languageId === '${fileTypes[index]}' || `;
    }
    // remove last comma - syntax error prevention
    documentLanguageId = documentLanguageId.substring(0,documentLanguageId.lastIndexOf("||")).trim();
    return documentLanguageId;
}

/**
 * Return regex format for all file types for Eclipse Che client template
 * input: 
 *          fileTypes - String[]
 * output:
 *          regex - String
 */
builder.getFileTypeRegex = function getFileTypeRegex(fileTypes) {
    let regex = "";
    for (let index = 0; index < fileTypes.length; index++) {
        regex += `${fileTypes[index]} | `;
    }
    // remove last comma - syntax error prevention
    regex = regex.substring(0,regex.lastIndexOf("|")).trim();
    return regex;
}

module.exports = builder;