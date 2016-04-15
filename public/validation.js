$(document).ready(function () {
    var minimumValidators = {
            row: '.col-xs-2',   // The title is placed inside a <div class="col-xs-4"> element
            validators: {
                notEmpty: {
                    message: 'The minimum value is required'
                },
                minimum : {
                  message : 'The minimum value is not valid'
                }
            }
        },
        maximumValidators = {
            row: '.col-xs-2',
            validators: {
                notEmpty: {
                    message: 'The maximum value is required'
                },
                maximum: {
                    message: 'The maximum value is not valid'
                }
            }
        },
        attributeValidators = {
            row: '.col-xs-2',
            validators: {
               /* notEmpty: {
                    message: 'The attribute is required'
                }*/
            }
        },
        opCodeValidators = {
            row: '.col-xs-2',
            validators: {
               /* notEmpty: {
                    message: 'The OpCode is required'
                }*/
            }
        },
        bookIndex = 0;

    $('#bookForm')
        .formValidation({
            framework: 'bootstrap',
            icon: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                'where[0].attribute': attributeValidators,
                'where[0].minimum': minimumValidators,
                'where[0].maximum': maximumValidators,
                'where[0].opCode' : opCodeValidators
            }
        })

        // Add button click handler
        .on('click', '.addButton', function() {
            bookIndex++;
            var $template = $('#bookTemplate')
                .formValidation({ excluded: ':disabled',}),
                $clone    = $template
                                .clone()
                                .removeClass('hide')
                                .removeAttr('id')
                                .attr('data-book-index', bookIndex)
                                .insertBefore($template);

            // Update the name attributes
            $clone
                .find('[name="attribute"]').attr('name', 'where[' + bookIndex + '].attribute').end()
                .find('[name="minimum"]').attr('name', 'where[' + bookIndex + '].minimum').end()
                .find('[name="maximum"]').attr('name', 'where[' + bookIndex + '].maximum').end()
                .find('[name="opCode"]').attr('name', 'where[' + bookIndex + '].opCode').end();

              console.log("Heyyy: ", $clone.find('[name="attribute"]'))
            // Add new fields
            // Note that we also pass the validator rules for new field as the third parameter
            $('#bookForm')
                .formValidation('addField', 'where[' + bookIndex + '].attribute', attributeValidators)
                .formValidation('addField', 'where[' + bookIndex + '].minimum', minimumValidators)
                .formValidation('addField', 'where[' + bookIndex + '].maximum', maximumValidators)
                .formValidation('addField', 'where[' + bookIndex + '].opCode', opCodeValidators);

            // $(".opCode").select2({width:"100%"});
        })

        // Remove button click handler
        .on('click', '.removeButton', function() {
            var $row  = $(this).parents('.form-group'),
                index = $row.attr('data-book-index');

            // Remove fields
            $('#bookForm')
                .formValidation('removeField', $row.find('[name="where[' + index + '].attribute"]'))
                .formValidation('removeField', $row.find('[name="where[' + index + '].minimum"]'))
                .formValidation('removeField', $row.find('[name="where[' + index + '].maximum"]'))
                .formValidation('removeField', $row.find('[name="where[' + index + '].opCode"]'));

            // Remove element containing the fields
            $row.remove();
        });
})